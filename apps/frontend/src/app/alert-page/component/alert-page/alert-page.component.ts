import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeverityType } from '../../../shared/enums/severityType';
import {
  Alert,
  AlertWithBackup,
  StorageFillAlert,
} from '../../../shared/types/alert';
import {
  BehaviorSubject,
  map,
  Observable,
  share,
  shareReplay,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { ClrDatagridSortOrder, ClrDatagridStateInterface } from '@clr/angular';
import { AlertServiceService } from '../../../shared/services/alert-service/alert-service.service';
import { AlertUtilsService } from '../../../shared/utils/alertUtils';
import { shortenBytes } from '../../../shared/utils/shortenBytes';

interface AlertSummary {
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
  repeatedAlerts: { type: string; count: number }[];
  mostFrequentAlert?: { type: string; count: number };
}

@Component({
  selector: 'app-alert-page',
  templateUrl: './alert-page.component.html',
  styleUrl: './alert-page.component.css',
})
export class AlertPageComponent implements OnInit, OnDestroy {
  protected readonly SeverityType = SeverityType;
  readonly DAYS = 30;
  readonly PAGE_SIZES = [10, 20, 50, 100];
  loading = false;
  selected: Alert[] = [];
  hasBackupInfo = false;
  error: string | null = null;
  shortenBytes = shortenBytes;

  // Statistics for summary
  criticalAlertsCount = 0;
  warningAlertsCount = 0;
  infoAlertsCount = 0;

  // Default sort order
  readonly descSort = ClrDatagridSortOrder.DESC;

  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  readonly alerts$ = this.alertsSubject.asObservable().pipe(shareReplay(1));

  readonly alertSummary$: Observable<AlertSummary> = this.alerts$.pipe(
    map(this.calculateAlertSummary),
    shareReplay(1)
  );

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly alertService: AlertServiceService,
    private readonly alertUtils: AlertUtilsService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();

    // Subscribe to refresh events
    this.alertService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAlerts();
      });
  }

  private loadAlerts(): void {
    this.loading = true;
    this.error = null;

    this.alertService
      .getAllAlerts(this.DAYS)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (alerts: Alert[]) => {
          this.alertsSubject.next(alerts);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading alerts:', error);
          this.error = 'Failed to load alerts. Please try again later.';
          this.loading = false;
        },
      });
  }

  private calculateAlertSummary(alerts: Alert[]): AlertSummary {
    const severityCounts = alerts.reduce(
      (acc, alert) => {
        switch (alert.alertType.severity) {
          case SeverityType.CRITICAL:
            acc.criticalCount++;
            break;
          case SeverityType.WARNING:
            acc.warningCount++;
            break;
          case SeverityType.INFO:
            acc.infoCount++;
            break;
        }
        return acc;
      },
      { criticalCount: 0, warningCount: 0, infoCount: 0 }
    );

    // Count repeated alerts
    const alertTypeCounts = alerts.reduce((acc, alert) => {
      const type = alert.alertType.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repeatedAlerts = Object.entries(alertTypeCounts)
      .filter(([_, count]) => count > 1)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      ...severityCounts,
      totalCount: alerts.length,
      repeatedAlerts,
      mostFrequentAlert: repeatedAlerts[0],
    };
  }

  // Type guard for StorageFillAlert
  isStorageFillAlert(alert: Alert): alert is StorageFillAlert {
    return alert.alertType.name === 'STORAGE_FILL_ALERT';
  }

  hasBackup(alert: Alert): alert is AlertWithBackup {
    return 'backup' in alert && alert.backup !== null;
  }

  getSeverityLabel(severity: SeverityType): string {
    return SeverityType[severity];
  }

  refresh(state: ClrDatagridStateInterface): void {
    this.loadAlerts();
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
