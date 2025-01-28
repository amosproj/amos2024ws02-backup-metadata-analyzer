import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertServiceService } from '../../../../shared/services/alert-service/alert-service.service';
import { Alert, StorageFillAlert } from '../../../../shared/types/alert';
import { DatePipe } from '@angular/common';
import { shortenBytes } from '../../../../shared/utils/shortenBytes';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { SeverityType } from '../../../../shared/enums/severityType';
import { AlertUtilsService } from '../../../../shared/utils/alertUtils';
import { AlertFilterParams } from '../../../../shared/types/alert-filter-type';
import { APIResponse } from '../../../../shared/types/api-response';

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
  total: number = 0;
  criticalAlertsCount = 0;
  warningAlertsCount = 0;
  infoAlertsCount = 0;

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
      this.criticalAlertsCount = alerts.filter(
        (alert) => alert.alertType.severity === SeverityType.CRITICAL
      ).length;
      this.warningAlertsCount = alerts.filter(
        (alert) => alert.alertType.severity === SeverityType.WARNING
      ).length;
      this.infoAlertsCount = alerts.filter(
        (alert) => alert.alertType.severity === SeverityType.INFO
      ).length;
      this.status = this.getStatus(alerts);
    });
  }

  loadAlerts(): void {
    let params: AlertFilterParams = { fromDate: this.fromDate.toISOString(), limit: 5 };
    this.alertService
      .getAllAlerts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: APIResponse<Alert>) => {
        const filteredAlerts = this.filterAlerts(response.data);
        this.alertsSubject.next(filteredAlerts);
        this.total = response.paginationData.total;
      });
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

  getStatus(alerts: Alert[] = []) {
    if (
      alerts.some((alert) => alert.alertType.severity === SeverityType.CRITICAL)
    ) {
      return 'Critical';
    } else if (
      alerts.some((alert) => alert.alertType.severity === SeverityType.WARNING)
    ) {
      return 'Warning';
    }
    return 'OK';
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
