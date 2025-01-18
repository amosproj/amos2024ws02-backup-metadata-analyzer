import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertPageComponent } from './alert-page.component';
import { AlertServiceService } from '../../../shared/services/alert-service/alert-service.service';
import { AlertUtilsService } from '../../../shared/utils/alertUtils';
import { NotificationService } from '../../../management/services/alert-notification/notification.service';
import { SeverityType } from '../../../shared/enums/severityType';
import { firstValueFrom, of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Alert } from '../../../shared/types/alert';
import { BackupType } from '../../../shared/enums/backup.types';

describe('AlertPageComponent', () => {
  let component: AlertPageComponent;
  let fixture: ComponentFixture<AlertPageComponent>;
  let alertService: AlertServiceService;
  let alertUtils: AlertUtilsService;
  let notificationService: NotificationService;

  const mockAlertTypes = [
    { id: '1', name: 'STORAGE_FILL_ALERT', severity: SeverityType.CRITICAL },
    { id: '2', name: 'BACKUP_ALERT', severity: SeverityType.WARNING },
  ];

  const mockAPIResponse = {
    data: [
      {
        id: '1',
        creationDate: new Date('2024-01-01'),
        alertType: {
          id: '1',
          name: 'STORAGE_FILL_ALERT',
          severity: SeverityType.CRITICAL,
          user_active: true,
          master_active: true,
        },
        filled: 80,
        capacity: 100,
        highWaterMark: 90,
        dataStoreName: 'store1',
      },
      {
        id: '2',
        creationDate: new Date('2024-01-02'),
        alertType: {
          id: '2',
          name: 'BACKUP_ALERT',
          severity: SeverityType.WARNING,
          user_active: true,
          master_active: true,
        },
        backup: {
          id: '1',
          sizeMB: 1000,
          creationDate: new Date('2024-01-02'),
          saveset: 'backup1',
          type: BackupType.DIFFERENTIAL,
        },
      },
    ],
    paginationData: {
      total: 2,
      limit: 10,
      offset: 0,
    },
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

  describe('Initialization', () => {
    it('should load alerts and alert types on init', async () => {
      component.ngOnInit();
      const alerts = await firstValueFrom(component.alerts$);
      expect(alerts).toEqual(mockAPIResponse);
      expect(mockServices.alertService.getAllAlerts).toHaveBeenCalled();
      expect(
        mockServices.notificationService.getNotificationSettings
      ).toHaveBeenCalled();
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

    it('should correctly identify alerts with backup', () => {
      const backupAlert = mockAPIResponse.data[1];
      expect(component.hasBackup(backupAlert)).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('should format severity label correctly', () => {
      expect(component.getSeverityLabel(SeverityType.CRITICAL)).toBe(
        'CRITICAL'
      );
      expect(component.getSeverityLabel(SeverityType.WARNING)).toBe('WARNING');
    });

    it('should delegate to alertUtils for formatting', () => {
      const mockAlert = mockAPIResponse.data[0];

      component.formatDate(mockAlert.creationDate);
      expect(mockServices.alertUtils.formatDate).toHaveBeenCalledWith(
        mockAlert.creationDate
      );

      component.getAlertReason(mockAlert);
      expect(mockServices.alertUtils.getAlertReason).toHaveBeenCalledWith(
        mockAlert
      );

      component.getAlertDetails(mockAlert);
      expect(mockServices.alertUtils.getAlertDetails).toHaveBeenCalledWith(
        mockAlert
      );
    });
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
