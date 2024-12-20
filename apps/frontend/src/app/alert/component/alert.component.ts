import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertServiceService } from '../service/alert-service.service';
import {
  Alert,
  CreationDateAlert,
  SizeAlert,
  StorageFillAlert,
} from '../../shared/types/alert';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil, tap } from 'rxjs';
import { SeverityType } from '../../shared/enums/severityType';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  providers: [DatePipe],
})
export class AlertComponent implements OnInit, OnDestroy {
  protected readonly SeverityType = SeverityType;
  readonly DAYS = 7;

  alerts: Alert[] = [];
  criticalAlertsCount: number = 0;
  warningAlertsCount: number = 0;
  infoAlertsCount: number = 0;

  status: 'OK' | 'Warning' | 'Critical' = 'OK';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly alertService: AlertServiceService,
    private datePipe: DatePipe
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
      .subscribe((data: Alert[]) => {
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
    } else if (alert.alertType.severity === SeverityType.WARNING) {
      return 'alert-yellow';
    } else {
      return 'alert-blue';
    }
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

  getAlertReason(alert: Alert) {
    let reason = '';
    let percentage = 0;
    switch (alert.alertType.name) {
      case 'SIZE_ALERT':
        const sizeAlert = alert as SizeAlert;
        if (sizeAlert.size - sizeAlert.referenceSize < 0) {
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
      case 'CREATION_DATE_ALERT':
        const creationDateAlert = alert as CreationDateAlert;
        reason = `Backup was started at an unusual time`;
        break;
      case 'STORAGE_FILL_ALERT':
        const storageFillAlert = alert as StorageFillAlert;
        reason = `Less available storage space than expected`;
        break;
    }
    return reason;
  }

  getAlertDetails(alert: Alert) {
    let description = '';
    let percentage = 0;
    switch (alert.alertType.name) {
      case 'SIZE_ALERT':
        const sizeAlert = alert as SizeAlert;
        if (sizeAlert.size - sizeAlert.referenceSize < 0) {
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
      case 'CREATION_DATE_ALERT':
        const creationDateAlert = alert as CreationDateAlert;

        description = `Backup was started at ${creationDateAlert.date.toString()}, but based on previous backups, it should have been started at around ${creationDateAlert.referenceDate.toString()}`;
        break;
      case 'STORAGE_FILL_ALERT':
        const storageFillAlert = alert as StorageFillAlert;
        description = `The current storage fill is ${storageFillAlert.filled.toString()} GiB, which is above the threshold of ${storageFillAlert.highWaterMark.toString()}
         GiB. This indicates insufficient available storage space. Maximum capacity is ${storageFillAlert.capacity.toString()} GiB`;
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
