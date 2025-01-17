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
  tap,
} from 'rxjs';
import { AlertServiceService } from '../../../shared/services/alert-service/alert-service.service';
import { AlertUtilsService } from '../../../shared/utils/alertUtils';
import { shortenBytes } from '../../../shared/utils/shortenBytes';
import { CustomAlertFilter } from './alertfilter';
import { ClrDatagridStateInterface } from '@clr/angular';
import { AlertFilterParams } from '../../../shared/types/alert-filter-type';
import { APIResponse } from '../../../shared/types/api-response';
import { NotificationService } from '../../../management/services/alert-notification/notification.service';
import { AlertType } from '../../../shared/types/alertType';
import { AlertSummary } from '../../../shared/types/alert-summary';

const INITIAL_FILTER: AlertFilterParams = {
  limit: 10,
  includeDeprecated: true,
};

@Component({
  selector: 'app-alert-page',
  templateUrl: './alert-page.component.html',
  styleUrl: './alert-page.component.css',
})
export class AlertPageComponent implements OnInit, OnDestroy {
  protected readonly SeverityType = SeverityType;
  readonly PAGE_SIZES = [10, 20, 50, 100];
  readonly pageSize = 10;
  loading = false;
  error: string | null = null;

  severityTypes = Object.values(SeverityType);

  protected alertDateFilter: CustomAlertFilter;
  protected alertSeveverityFilter: CustomAlertFilter;
  protected alertTypeFilter: CustomAlertFilter;

  readonly alertTypeSubject = new BehaviorSubject<AlertType[]>([]);
  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$: Observable<APIResponse<Alert>> = of({
    data: [],
    total: 0,
    paginationData: { limit: 0, offset: 0, total: 0 },
  });
  private readonly filterOptions$ = new BehaviorSubject<AlertFilterParams>(
    INITIAL_FILTER
  );

  readonly alertSummary$: Observable<AlertSummary> = this.alertsSubject.pipe(
    map((alerts) => {
      if (!alerts || alerts.length === 0) {
        return {
          criticalCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalCount: 0,
          repeatedAlerts: [],
          mostFrequentAlert: undefined,
        };
      }
      return this.calculateAlertSummary(alerts);
    }),
    shareReplay(1)
  );

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly alertService: AlertServiceService,
    private readonly alertUtils: AlertUtilsService,
    private readonly alertTypeService: NotificationService
  ) {
    this.alertSeveverityFilter = new CustomAlertFilter('severity');
    this.alertDateFilter = new CustomAlertFilter('date');
    this.alertTypeFilter = new CustomAlertFilter('alertType');
  }

  ngOnInit(): void {
    this.loadAlerts();
    this.loadAlertTypes();

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
    this.error = null;

    this.alerts$ = this.filterOptions$.pipe(
      switchMap((params) => this.alertService.getAllAlerts(params)),
      tap((response) => {
        this.alertsSubject.next(response.data);
      }),
      takeUntil(this.destroy$)
    );
  }

  private loadAlertTypes(): void {
    this.alertTypeService.getNotificationSettings().subscribe((response) => {
      this.alertTypeSubject.next(response);
    });
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

    // Group alerts by their matching criteria
    const alertGroups = alerts.reduce((groups, alert) => {
      let groupKey: string;

      switch (alert.alertType.name) {
        case 'STORAGE_FILL_ALERT':
          // Group by storage medium
          groupKey = `storage_${(alert as StorageFillAlert).id}`;
          break;
        case 'SIZE_ALERT':
        case 'MISSING_BACKUP':
          // Group by task
          groupKey = `task_${alert.backup?.taskId || 'unknown'}`;
          break;
        default:
          // Group by type only
          groupKey = alert.alertType.name;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(alert);
      return groups;
    }, {} as Record<string, Alert[]>);

    // Convert groups to RepeatedAlert format
    const repeatedAlerts = Object.entries(alertGroups)
      .map(([key, groupAlerts]) => {
        // Sort alerts by date descending
        const sortedAlerts = groupAlerts.sort(
          (a, b) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime()
        );

        const latestAlert = sortedAlerts[0];
        const history = sortedAlerts.slice(0, 5).map((alert) => ({
          date: new Date(alert.creationDate),
          details: this.getAlertDetails(alert),
          severity: alert.alertType.severity,
        }));

        return {
          type: latestAlert.alertType.name,
          count: groupAlerts.length,
          latestAlert,
          history,
          taskId: latestAlert.backup?.taskId?.toString(),
          storageId: (latestAlert as StorageFillAlert).id?.toString(),
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      ...severityCounts,
      totalCount: alerts.length,
      repeatedAlerts,
      mostFrequentAlert: repeatedAlerts[0],
    };
  }

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
