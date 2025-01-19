import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  Alert,
  CreationDateAlert,
  SizeAlert,
  StorageFillAlert,
} from '../types/alert';
import { SeverityType } from '../enums/severityType';
import { shortenBytes } from './shortenBytes';

@Injectable({
  providedIn: 'root',
})
export class AlertUtilsService {
  constructor(private datePipe: DatePipe) {}

  getAlertClass(alert: Alert): string {
    if (alert.alertType.severity === SeverityType.CRITICAL) {
      return 'alert-red';
    } else if (alert.alertType.severity === SeverityType.WARNING) {
      return 'alert-yellow';
    } else {
      return 'alert-blue';
    }
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

  getAlertDetails(alert: Alert): string {
    let description = '';
    let percentage = 0;
    switch (alert.alertType.name) {
      case 'SIZE_ALERT':
        const sizeAlert = alert as SizeAlert;
        if (!sizeAlert.size || !sizeAlert.referenceSize) {
          return 'Invalid size values in the alert';
        }

        if (sizeAlert.size - sizeAlert.referenceSize < 0) {
          percentage = sizeAlert.referenceSize > 0 
            ? Math.floor((1 - sizeAlert.size / sizeAlert.referenceSize) * 100)
            : 0;
          description = `Size of backup decreased by ${percentage}% compared to the previous backup. This could indicate a problem with the backup.`;
          break;
        } else {
          percentage = sizeAlert.referenceSize > 0 
            ? Math.floor((sizeAlert.size / sizeAlert.referenceSize - 1) * 100)
            : 0;
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
        description = `The current storage fill of storage with name "${
          storageFillAlert.dataStoreName
        }" is ${shortenBytes(
          storageFillAlert.filled * 1_000_000_000
        )}, which is above the threshold of ${shortenBytes(
          storageFillAlert.highWaterMark * 1_000_000_000
        )}`;
        break;
    }
    return description;
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd.MM.yyyy HH:mm') || '';
  }
}
