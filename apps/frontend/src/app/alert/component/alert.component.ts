import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertServiceService } from '../service/alert-service.service';
import { Alert } from '../../shared/types/alert';
import { DatePipe } from '@angular/common';
import { AlertType } from '../../shared/enums/alertType';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  providers: [DatePipe],
})
export class AlertComponent implements OnInit, OnDestroy {
  readonly DAYS = 7;

  alerts: Alert[] = [];
  criticalAlertsCount: number = 0;
  nonCriticalAlertsCount: number = 0;

  criticalAlertTypes: AlertType[] = [];

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
        const criticalAlerts = data.filter((alert) =>
          this.criticalAlertTypes.includes(alert.type)
        );
        const nonCriticalAlerts = data.filter(
          (alert) => !this.criticalAlertTypes.includes(alert.type)
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
    if (this.criticalAlertTypes.includes(alert.type)) {
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
      this.alerts.some((alert) => this.criticalAlertTypes.includes(alert.type))
    ) {
      return 'Critical';
    }
    return 'Warning';
  }

  getAlertReason(alert: Alert) {
    let reason = '';
    let percentage = 0;
    switch (alert.type) {
      case AlertType.SIZE_DECREASED:
        percentage = Math.floor((1 - alert.value / alert.referenceValue) * 100);
        reason = `Size of backup decreased`;
        break;
      case AlertType.SIZE_INCREASED:
        percentage = Math.floor((alert.value / alert.referenceValue - 1) * 100);
        reason = `Size of backup increased`;
        break;
    }
    return reason;
  }

  getAlertDetails(alert: Alert) {
    let description = '';
    let percentage = 0;
    switch (alert.type) {
      case AlertType.SIZE_DECREASED:
        percentage = Math.floor((1 - alert.value / alert.referenceValue) * 100);
        description = `Size of backup decreased by ${percentage}% compared to the previous backup. This could indicate a problem with the backup.`;
        break;
      case AlertType.SIZE_INCREASED:
        percentage = Math.floor((alert.value / alert.referenceValue - 1) * 100);
        description = `Size of backup increased by ${percentage}% compared to the previous backup. This could indicate a problem with the backup.`;
        break;
    }
    return description;
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd.MM.yyyy HH:mm') || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
