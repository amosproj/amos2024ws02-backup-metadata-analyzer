import { Component, OnInit } from '@angular/core';
import { AlertServiceService } from '../service/alert-service.service';
import { Alert } from '../../shared/types/alert';
import { AlertType } from '../../../../../backend/src/app/alerting/dto/alertType';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  providers: [DatePipe],
})
export class AlertComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(
    private readonly alertService: AlertServiceService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.alertService.getAllAlerts().subscribe((data: Alert[]) => {
      this.alerts = data;
    });
  }

  getAlertClass(): string {
    if (this.alerts.length > 0) {
      return 'alert-yellow';
    }
    return 'alert-green';
  }

  getStatus() {
    if (this.alerts.length > 0) {
      return 'Warning';
    }
    return 'OK';
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
}
