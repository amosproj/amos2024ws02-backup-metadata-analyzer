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

  alerts: Alert[] = [];
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
      .getAllAlerts(this.DAYS)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Alert[]) => {
          this.criticalAlertsCount = data.filter(
            (alert) => alert.alertType.severity === SeverityType.CRITICAL
          ).length;
          this.warningAlertsCount = data.filter(
            (alert) => alert.alertType.severity === SeverityType.WARNING
          ).length;
          this.infoAlertsCount = data.filter(
            (alert) => alert.alertType.severity === SeverityType.INFO
          ).length;
          this.alerts = data;
          this.status = this.getStatus();
        },
        error: (error) => {
          console.error('Error loading alerts:', error);
        },
      });
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
