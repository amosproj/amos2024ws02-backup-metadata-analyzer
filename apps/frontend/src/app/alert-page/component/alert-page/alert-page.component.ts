import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeverityType } from '../../../shared/enums/severityType';
import { Alert, StorageFillAlert } from '../../../shared/types/alert';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { AlertServiceService } from '../../../shared/services/alert-service/alert-service.service';
import { AlertUtilsService } from '../../../shared/utils/alertUtils';
import { shortenBytes } from '../../../shared/utils/shortenBytes';
import { CustomAlertFilter } from './alertfilter';
import { ClrDatagridStateInterface } from '@clr/angular';
import { AlertFilterParams } from '../../../shared/types/alert-filter-type';
import { APIResponse } from '../../../shared/types/api-response';

const INITIAL_FILTER: AlertFilterParams = {
  limit: 10,
};

interface AlertSummary {
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
  repeatedAlerts: { type: string; count: number }[];
  mostFrequentAlert?: { type: string; count: number };
}

@Component({
  selector: 'app-alert-page',
  templateUrl: './alert-page.component.html',
  styleUrl: './alert-page.component.css',
})
export class AlertPageComponent implements OnInit, OnDestroy {
  protected readonly SeverityType = SeverityType;
  readonly PAGE_SIZES = [10, 20, 50, 100];
  pageSize = 10;
  loading = false;
  error: string | null = null;

  severityTypes = Object.values(SeverityType);

  protected alertDateFilter: CustomAlertFilter;
  protected alertSeveverityFilter: CustomAlertFilter;
  protected alertTypeFilter: CustomAlertFilter;

  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$: Observable<APIResponse<Alert>> = of({
    data: [],
    total: 0,
    paginationData: { limit: 0, offset: 0, total: 0 },
  });
  private readonly filterOptions$ = new BehaviorSubject<AlertFilterParams>(
    INITIAL_FILTER
  );

  readonly alertSummary$: Observable<AlertSummary> = this.alerts$.pipe(
    map((response) => this.calculateAlertSummary(response.data)),
    shareReplay(1)
  );

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly alertService: AlertServiceService,
    private readonly alertUtils: AlertUtilsService
  ) {
    this.alertSeveverityFilter = new CustomAlertFilter('severity');
    this.alertDateFilter = new CustomAlertFilter('date');
    this.alertTypeFilter = new CustomAlertFilter('alertType');
  }

  ngOnInit(): void {
    this.loadAlerts();

    this.alertService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAlerts();
      });

    combineLatest([
      this.alertDateFilter.changes.pipe(startWith(null)),
      this.alertSeveverityFilter.changes.pipe(startWith(null)),
      this.alertTypeFilter.changes.pipe(startWith(null)),
    ])
      .pipe(
        map(() => this.buildFilterParams()),
        takeUntil(this.destroy$)
      )
      .subscribe((params) => this.filterOptions$.next(params));
  }

  private loadAlerts(): void {
    this.loading = true;
    this.error = null;

    this.alerts$ = this.filterOptions$.pipe(
      switchMap((params) => this.alertService.getAllAlerts(params)),
      takeUntil(this.destroy$)
    );
  }

  private calculateAlertSummary(alerts: Alert[]): AlertSummary {
    const severityCounts = alerts.reduce(
      (acc, alert) => {
        switch (alert.alertType.severity) {
          case SeverityType.CRITICAL:
            acc.criticalCount++;
            break;
          case SeverityType.WARNING:
            acc.warningCount++;
            break;
          case SeverityType.INFO:
            acc.infoCount++;
            break;
        }
        return acc;
      },
      { criticalCount: 0, warningCount: 0, infoCount: 0 }
    );

    const alertTypeCounts = alerts.reduce((acc, alert) => {
      const type = alert.alertType.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repeatedAlerts = Object.entries(alertTypeCounts)
      .filter(([_, count]) => count > 1)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      ...severityCounts,
      totalCount: alerts.length,
      repeatedAlerts,
      mostFrequentAlert: repeatedAlerts[0],
    };
  }

  // setAlertSeverityTypes(types: SeverityType[]): void {
  //   this.selectedAlertSeverityTypes = types;
  //   this.alertSeveverityFilter.updateRanges({ severity: types });
  // }

  /**
   * Set filter options for the backup table
   * @returns Filter options
   */
  private buildFilterParams(): AlertFilterParams {
    const params: AlertFilterParams = { ...INITIAL_FILTER };

    if (this.alertDateFilter.isActive()) {
      params.fromDate = this.alertDateFilter.ranges.fromDate;
      params.toDate = this.alertDateFilter.ranges.toDate;
    }

    if (this.alertSeveverityFilter.isActive()) {
      params.severity = this.alertSeveverityFilter.ranges.severity;
    }

    if (this.alertTypeFilter.isActive()) {
      params.alertType = this.alertTypeFilter.ranges.alertType;
    }

    params.includeDeprecated = true;

    return params;
  }

  /**
   * Check the filter states and add new filter values to the filterOptions$ subject
   * @param state filter values
   */
  refresh(state: ClrDatagridStateInterface<any>): void {
    this.loading = true;

    const params: AlertFilterParams = {
      ...INITIAL_FILTER,
      limit: state.page?.size ?? this.pageSize,
      offset: state.page?.current
        ? (state.page.current - 1) * (state.page?.size ?? this.pageSize)
        : 0,
      sortOrder: state.sort?.reverse ? 'DESC' : 'ASC',
      includeDeprecated: true,
      //orderBy: state.sort?.by ? state.sort.by.toString() : 'date',
    };

    if (state.filters) {
      Object.assign(params, this.buildFilterParams());
    }

    this.filterOptions$.next(params);
    this.loading = false;
  }

  isStorageFillAlert(alert: Alert): alert is StorageFillAlert {
    return alert.alertType.name === 'STORAGE_FILL_ALERT';
  }

  hasBackup(alert: Alert): alert is Alert {
    return 'backup' in alert && alert.backup !== null;
  }

  getSeverityLabel(severity: SeverityType): string {
    return SeverityType[severity];
  }

  formatDate = (date: Date): string => this.alertUtils.formatDate(date);

  getAlertReason = (alert: Alert): string =>
    this.alertUtils.getAlertReason(alert);

  getAlertDetails = (alert: Alert): string =>
    this.alertUtils.getAlertDetails(alert);

  protected shortenBytes = shortenBytes;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
