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
import {
  AlertSummary
} from '../../../shared/types/alert-summary';

const INITIAL_ALERT_SUMMARY: AlertSummary = {
  criticalAlerts: 0,
  warningAlerts: 0,
  infoAlerts: 0,
  repeatedAlerts: [],
  mostFrequentAlert: {
    severity: SeverityType.CRITICAL,
    type: '',
    taskId: '',
    displayName: '',
    count: '',
    history: [],
    latestAlert: {
      id: '',
      alertType: {
        id: '',
        name: '',
        severity: SeverityType.CRITICAL,
        user_active: true,
        master_active: true,
      },
      creationDate: new Date(),
    },
    firstOccurence: new Date().toISOString(),
  },
};

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
  loading = false;
  error: string | null = null;

  severityTypes = Object.values(SeverityType);

  readonly alertDateFilter: CustomAlertFilter;
  readonly alertSeverityFilter: CustomAlertFilter;
  readonly alertTypeFilter: CustomAlertFilter;

  readonly alertTypeSubject = new BehaviorSubject<AlertType[]>([]);
  alerts$: Observable<APIResponse<Alert>> = of({
    data: [],
    total: 0,
    paginationData: { limit: 0, offset: 0, total: 0 },
  });
  private readonly filterOptions$ = new BehaviorSubject<AlertFilterParams>(
    INITIAL_FILTER
  );

  protected alertSummary$: Observable<AlertSummary> = of(INITIAL_ALERT_SUMMARY);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly alertService: AlertServiceService,
    private readonly alertUtils: AlertUtilsService,
    private readonly alertTypeService: NotificationService
  ) {
    this.alertSeverityFilter = new CustomAlertFilter('severity');
    this.alertDateFilter = new CustomAlertFilter('date');
    this.alertTypeFilter = new CustomAlertFilter('alertType');
  }
  ngOnInit(): void {
    this.loadAlerts();
    this.loadAlertTypes();
    this.loadAlertSummary();

    this.alertService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAlerts();
        this.loadAlertSummary();
      });

    combineLatest([
      this.alertDateFilter.changes.pipe(startWith(null)),
      this.alertSeverityFilter.changes.pipe(startWith(null)),
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
      takeUntil(this.destroy$)
    );
  }

  private loadAlertTypes(): void {
    this.alertTypeService.getNotificationSettings().subscribe((response) => {
      this.alertTypeSubject.next(response);
    });
  }

  private loadAlertSummary(): void {
    this.alertSummary$ = this.alertService
      .getAlertRepetitions()
      .pipe(shareReplay(1));
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

    if (this.alertSeverityFilter.isActive()) {
      params.severity = this.alertSeverityFilter.ranges.severity;
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
      limit: state.page?.size ?? 10,
      offset: state.page?.current
        ? (state.page.current - 1) * (state.page?.size ?? 10)
        : 0,
      sortOrder: state.sort?.reverse ? 'DESC' : 'ASC',
      orderBy: state.sort?.by ? state.sort.by.toString() : 'date',
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

  /**
   * Select the alert type icon
   * @param severity type of alert
   * @returns severity icon
   */
  protected getSeverityIcon(severity: SeverityType | undefined): string {
    if (!severity) return 'info-standard';

    switch (severity) {
      case SeverityType.CRITICAL:
        return 'error-standard';
      case SeverityType.WARNING:
        return 'warning-standard';
      case SeverityType.INFO:
        return 'info-standard';
      default:
        return 'info-standard';
    }
  }
}
