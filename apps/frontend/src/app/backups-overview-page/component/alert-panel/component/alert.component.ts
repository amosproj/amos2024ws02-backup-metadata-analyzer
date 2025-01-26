import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertServiceService } from '../../../../shared/services/alert-service/alert-service.service';
import { Alert, StorageFillAlert } from '../../../../shared/types/alert';
import {
  BehaviorSubject,
  Observable,
  of,
  shareReplay,
  Subject,
  takeUntil,
} from 'rxjs';
import { SeverityType } from '../../../../shared/enums/severityType';
import { AlertUtilsService } from '../../../../shared/utils/alertUtils';
import { AlertFilterParams } from '../../../../shared/types/alert-filter-type';
import { APIResponse } from '../../../../shared/types/api-response';
import { AlertCounts } from '../../../../shared/types/alertCounts';

const INITIAL_ALERT_COUNTS: AlertCounts = {
  criticalAlerts: 0,
  warningAlerts: 0,
  infoAlerts: 0,
};

const PARAMS: AlertFilterParams = {
  limit: 5,
  orderBy: 'severity',
};

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent implements OnInit, OnDestroy {
  total = 0;
  status: 'OK' | 'Warning' | 'Critical' | 'INFO' = 'OK';
  protected readonly SeverityType = SeverityType;
  readonly DAYS = 7;
  private readonly fromDate = new Date(
    Date.now() - this.DAYS * 24 * 60 * 60 * 1000
  );

  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  readonly alerts$ = this.alertsSubject.asObservable();
  protected alertCounts$: Observable<AlertCounts> = of(INITIAL_ALERT_COUNTS);
  total = 0;

  protected alertCounts$: Observable<AlertCounts> = of(INITIAL_ALERT_COUNTS);

  status: 'OK' | 'Warning' | 'Critical' = 'OK';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly alertService: AlertServiceService,
    private readonly alertUtils: AlertUtilsService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();

    this.alertService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAlerts();
      });

    this.alerts$.pipe(takeUntil(this.destroy$)).subscribe((alerts) => {
      this.status = this.getStatus();
    });
  }
  /**
   * Loads alerts from the alert service and updates the alertsSubject
   */
  loadAlerts(): void {
    this.alertService
      .getAllAlerts({ ...PARAMS, fromDate: this.fromDate.toISOString() })
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: APIResponse<Alert>) => {
        const filteredAlerts = this.filterAlerts(response.data);
        this.alertsSubject.next(filteredAlerts);
        this.total = response.paginationData.total;
      });

    this.alertCounts$ = this.alertService
      .getAlertCounts(this.fromDate.toISOString())
      .pipe(shareReplay(1));
  }
  /**
   * Iteraates through alerts and filters them by alertType
   * @param alerts items to filter
   * @returns Arrayy of Alerts filtered by alertType
   */
  filterAlerts(alerts: Alert[]): Alert[] {
    const alertMap = new Map<string, StorageFillAlert>();
    const filteredAlerts: Alert[] = [];

    alerts.sort((a, b) => {
      return (
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
      );
    });
    alerts.forEach((alert) => {
      // If alert is from type STORAGE_FILL_ALERT, only one is shown per data store
      if (alert.alertType.name === 'STORAGE_FILL_ALERT') {
        const storageFillAlert = alert as StorageFillAlert;
        if (!alertMap.has(storageFillAlert.dataStoreName)) {
          alertMap.set(storageFillAlert.dataStoreName, storageFillAlert);
          filteredAlerts.push(storageFillAlert);
        }
      } else {
        filteredAlerts.push(alert);
      }
    });

    return filteredAlerts;
  }
  /**
   *
   * @returns Status of alerts to set css  class
   */
  getStatusClass(): string {
    switch (this.status) {
      case 'Critical':
        return 'status-red';
      case 'Warning':
        return 'status-yellow';
    }
    return 'status-green';
  }
  /**
   *
   * @returns Status of alerts as string
   */
  getStatus(): 'OK' | 'Warning' | 'Critical' | 'INFO' {
    let status: 'OK' | 'Warning' | 'Critical' | 'INFO' = 'OK';

    this.alertCounts$.subscribe((counts) => {
      if (counts.criticalAlerts > 0) {
        status = 'Critical';
      } else if (counts.warningAlerts > 0) {
        status = 'Warning';
      }
    });

    return status;
  }

  getAlertClass = (alert: Alert): string =>
    this.alertUtils.getAlertClass(alert);

  formatDate = (date: Date): string => this.alertUtils.formatDate(date);

  getAlertReason = (alert: Alert): string =>
    this.alertUtils.getAlertReason(alert);

  getAlertDetails = (alert: Alert): string =>
    this.alertUtils.getAlertDetails(alert);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
