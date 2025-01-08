import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertServiceService } from '../../../../shared/services/alert-service/alert-service.service';
import {
  Alert,
  CreationDateAlert,
  SizeAlert,
  StorageFillAlert,
} from '../../../../shared/types/alert';
import { DatePipe } from '@angular/common';
import { shortenBytes } from '../../../../shared/utils/shortenBytes';
import { Subject, takeUntil } from 'rxjs';
import { SeverityType } from '../../../../shared/enums/severityType';

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
  criticalAlertsCount = 0;
  warningAlertsCount = 0;
  infoAlertsCount = 0;

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
        this.alerts = this.filterAlerts(data);
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
        reason = `Backup was started at an unusual time`;
        break;
      case 'STORAGE_FILL_ALERT':
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

        description = `Backup was started at ${this.formatDate(
          creationDateAlert.date
        )}, but based on the defined schedule, it should have been started at around ${this.formatDate(
          creationDateAlert.referenceDate
        )}`;
        break;
      case 'STORAGE_FILL_ALERT':
        const storageFillAlert = alert as StorageFillAlert;
        description = `The current storage fill is ${shortenBytes(
          storageFillAlert.filled * 1_000_000_000
        )}, which is above the threshold of ${shortenBytes(
          storageFillAlert.highWaterMark * 1_000_000_000
        )}. This indicates insufficient available storage space. Maximum capacity is ${shortenBytes(
          storageFillAlert.capacity * 1_000_000_000
        )}`;
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
