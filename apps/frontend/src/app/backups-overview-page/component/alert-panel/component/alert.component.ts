import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertServiceService } from '../../../../shared/services/alert-service/alert-service.service';
import { Alert } from '../../../../shared/types/alert';
import { Subject, takeUntil } from 'rxjs';
import { SeverityType } from '../../../../shared/enums/severityType';
import { AlertUtilsService } from '../../../../shared/utils/alertUtils';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent implements OnInit, OnDestroy {
  protected readonly SeverityType = SeverityType;
  readonly DAYS = 7;
  private readonly fromDate = new Date(Date.now() - this.DAYS * 24 * 60 * 60 * 1000);

  alerts: Alert[] = [];
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
  }

  loadAlerts(): void {
    this.alertService
      .getAllAlerts(this.fromDate.toISOString())
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { alerts: Alert[], total: number }) => {
      console.log("Data: ", data);
      this.alerts = this.filterAlerts(data.alerts);
      this.total = data.total;
      this.criticalAlertsCount = this.alerts.filter(
        (alert) => alert.alertType.severity === SeverityType.CRITICAL
      ).length;
      this.warningAlertsCount = this.alerts.filter(
        (alert) => alert.alertType.severity === SeverityType.WARNING
      ).length;
      this.infoAlertsCount = this.alerts.filter(
        (alert) => alert.alertType.severity === SeverityType.INFO
      ).length;
      this.status = this.getStatus();
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

  getStatus() {
    if (
      this.alerts.some(
        (alert) => alert.alertType.severity === SeverityType.CRITICAL
      )
    ) {
      return 'Critical';
    } else if (
      this.alerts.some(
        (alert) => alert.alertType.severity === SeverityType.WARNING
      )
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
