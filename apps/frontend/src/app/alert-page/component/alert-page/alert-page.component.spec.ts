import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertPageComponent } from './alert-page.component';
import { AlertServiceService } from '../../../shared/services/alert-service/alert-service.service';
import { AlertUtilsService } from '../../../shared/utils/alertUtils';
import { NotificationService } from '../../../management/services/alert-notification/notification.service';
import { SeverityType } from '../../../shared/enums/severityType';
import { firstValueFrom, of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Alert } from '../../../shared/types/alert';
import { randomUUID } from 'node:crypto';
import { BackupType } from '../../../shared/enums/backup.types';

describe('AlertPageComponent', () => {
  let component: AlertPageComponent;
  let fixture: ComponentFixture<AlertPageComponent>;
  let alertService: AlertServiceService;
  let alertUtils: AlertUtilsService;
  let notificationService: NotificationService;

  const mockAlerts: Alert[] = [
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'test',
          severity: SeverityType.CRITICAL,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 0,
          creationDate: new Date(),
          saveset: 'saveset',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
      },
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 0,
          creationDate: new Date(),
          saveset: 'saveset',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
      },
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'test',
          severity: SeverityType.WARNING,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 0,
          creationDate: new Date(),
          saveset: 'saveset',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
      },
    ];

  const mockAlertService = {
    getAllAlerts: vi.fn(),
    getRefreshObservable: vi.fn(),
  };

  const mockServices = {
    alertService: {
      getAllAlerts: vi.fn().mockReturnValue(of(mockAPIResponse)),
      getRefreshObservable: vi.fn().mockReturnValue(of(null)),
    },
    alertUtils: {
      formatDate: vi.fn().mockReturnValue('formatted-date'),
      getAlertReason: vi.fn().mockReturnValue('alert-reason'),
      getAlertDetails: vi.fn().mockReturnValue('alert-details'),
    },
    notificationService: {
      getNotificationSettings: vi.fn().mockReturnValue(of(mockAlertTypes)),
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertPageComponent],
      providers: [
        { provide: AlertServiceService, useValue: mockServices.alertService },
        { provide: AlertUtilsService, useValue: mockServices.alertUtils },
        {
          provide: NotificationService,
          useValue: mockServices.notificationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertPageComponent);
    component = fixture.componentInstance;
    alertService = TestBed.inject(AlertServiceService);
    alertUtils = TestBed.inject(AlertUtilsService);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load alerts on init', () => {
    expect(mockAlertService.getAllAlerts).toHaveBeenCalledWith();
    expect(component.loading).toBe(false);
  });

    it('should handle error when loading alerts fails', async () => {
      mockServices.alertService.getAllAlerts.mockReturnValueOnce(
        throwError(() => new Error('Network error'))
      );

      component.ngOnInit();
      await fixture.detectChanges();

      try {
        await firstValueFrom(component.alerts$);
      } catch (error: unknown) {
        expect(error).toBeDefined();
        if (error instanceof Error) {
          expect(error.message).toBe('Network error');
        }
      }
    });
  });

  describe('Alert Type Handling', () => {
    it('should correctly identify StorageFillAlert', () => {
      const storageFillAlert = mockAPIResponse.data[0];
      expect(component.isStorageFillAlert(storageFillAlert)).toBe(true);
    });

    component.alertSummary$.subscribe((summary) => {
      expect(summary.criticalCount).toBe(1);
      expect(summary.warningCount).toBe(1);
      expect(summary.infoCount).toBe(1);
      expect(summary.totalCount).toBe(3);
    });
  });

  it('should format severity label correctly', () => {
    expect(component.getSeverityLabel(SeverityType.CRITICAL)).toBe('CRITICAL');
    expect(component.getSeverityLabel(SeverityType.WARNING)).toBe('WARNING');
  });

  describe('Cleanup', () => {
    it('should clean up subscriptions on destroy', () => {
      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
