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

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent implements OnInit, OnDestroy {
  protected readonly SeverityType = SeverityType;
  readonly DAYS = 7;
  private readonly fromDate = new Date(
    Date.now() - this.DAYS * 24 * 60 * 60 * 1000
  );

  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  readonly alerts$ = this.alertsSubject.asObservable();
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

  loadAlerts(): void {
    const params: AlertFilterParams = {
      fromDate: this.fromDate.toISOString(),
      limit: 5,
      orderBy: 'severity',
    };
    this.alertService
      .getAllAlerts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: APIResponse<Alert>) => {
        const filteredAlerts = this.filterAlerts(response.data);
        this.alertsSubject.next(filteredAlerts);
        this.total = response.paginationData.total;
      });

    this.alertCounts$ = this.alertService.getAlertCounts().pipe(shareReplay(1));
  }

  filterAlerts(alerts: Alert[]): Alert[] {
    const alertMap = new Map<string, StorageFillAlert>();

    const filteredAlerts: Alert[] = [];

    // sort alerts by creationDate
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

  getStatusClass(): string {
    switch (this.status) {
      case 'Critical':
        return 'status-red';
      case 'Warning':
        return 'status-yellow';
    }
    return 'status-green';
  }

  getStatus(): 'OK' | 'Warning' | 'Critical' {
    let status: 'OK' | 'Warning' | 'Critical' = 'OK';

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
