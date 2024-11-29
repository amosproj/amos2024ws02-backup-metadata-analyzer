import { Component, OnInit } from '@angular/core';
import { AlertServiceService } from '../service/alert-service.service';
import { Alert, SizeAlert } from '../../shared/types/alert';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { SeverityType } from '../../shared/enums/severityType';
import { AlertType } from '../../shared/types/alertType';

//TODO: Handle info alerts
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  providers: [DatePipe],
})
export class AlertComponent implements OnInit {
  readonly DAYS = 7;

  alerts: Alert[] = [];
  criticalAlertsCount: number = 0;
  nonCriticalAlertsCount: number = 0;

  status: 'OK' | 'Warning' | 'Critical' = 'OK';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly alertService: AlertServiceService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.alertService
      .getAllAlerts(this.DAYS)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Alert[]) => {
        const criticalAlerts = data.filter(
          (alert) => alert.alertType.severity === SeverityType.CRITICAL
        );
        const nonCriticalAlerts = data.filter(
          (alert) => alert.alertType.severity === SeverityType.WARNING
        );
        this.criticalAlertsCount = criticalAlerts.length;
        this.nonCriticalAlertsCount = nonCriticalAlerts.length;
        this.alerts = [...criticalAlerts, ...nonCriticalAlerts];
        this.status = this.getStatus();
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

  getAlertClass(alert: Alert): string {
    if (alert.alertType.severity === SeverityType.CRITICAL) {
      return 'alert-red';
    } else {
      return 'alert-yellow';
    }
  }

  getStatus() {
    if (this.alerts.length === 0) {
      return 'OK';
    }
    if (
      this.alerts.some(
        (alert) => alert.alertType.severity === SeverityType.CRITICAL
      )
    ) {
      return 'Critical';
    }
    return 'Warning';
  }

  getAlertReason(alert: Alert) {
    let reason = '';
    let percentage = 0;
    switch (alert.alertType.name) {
      case 'SIZE_ALERT':
        const sizeAlert = alert as SizeAlert;
        if (sizeAlert.size < sizeAlert.referenceSize) {
          percentage = Math.floor(
            (1 - sizeAlert.size / sizeAlert.referenceSize) * 100
          );
          reason = `Size of backup decreased`;
          break;
        } else {
          percentage = Math.floor(
            (sizeAlert.size / sizeAlert.referenceSize - 1) * 100
          );
          reason = `Size of backup increased`;
          break;
        }
    }
    return reason;
  }

  getAlertDetails(alert: Alert) {
    let description = '';
    let percentage = 0;
    switch (alert.alertType.name) {
      case 'SIZE_ALERT':
        const sizeAlert = alert as SizeAlert;
        if (sizeAlert.size < sizeAlert.referenceSize) {
          percentage = Math.floor(
            (1 - sizeAlert.size / sizeAlert.referenceSize) * 100
          );
          description = `Size of backup decreased by ${percentage}% compared to the previous backup. This could indicate a problem with the backup.`;
          break;
        } else {
          percentage = Math.floor(
            (sizeAlert.size / sizeAlert.referenceSize - 1) * 100
          );
          description = `Size of backup increased by ${percentage}% compared to the previous backup. This could indicate a problem with the backup.`;
          break;
        }
    }
    return description;
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd.MM.yyyy HH:mm') || '';
  }

  protected readonly AlertType = AlertType;
  protected readonly SeverityType = SeverityType;
}
