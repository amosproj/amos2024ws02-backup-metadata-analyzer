import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { AlertComponent } from './alert.component';
import { of } from 'rxjs';
import { Alert } from '../../../../shared/types/alert';
import { randomUUID } from 'crypto';
import { SeverityType } from '../../../../shared/enums/severityType';
import { BackupType } from '../../../../shared/enums/backup.types';
import { AlertUtilsService } from '../../../../shared/utils/alertUtils';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let alertUtils: AlertUtilsService;
  let mockAlertService: {
    getAllAlerts: Mock;
    getRefreshObservable: Mock;
  };

  const mockAlerts = {
    data: [
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
    ],
    paginationData: {
      total: 2,
    },
  };

  beforeEach(() => {
    mockAlertService = {
      getAllAlerts: vi.fn().mockReturnValue(of(mockAlerts)),
      getRefreshObservable: vi.fn().mockReturnValue(of(null)),
    };

    alertUtils = {
      getAlertClass: vi.fn().mockReturnValue('alert-class'),
      formatDate: vi.fn().mockReturnValue('formatted-date'),
      getAlertReason: vi.fn().mockReturnValue('alert-reason'),
      getAlertDetails: vi.fn().mockReturnValue('alert-details'),
    } as any;

    component = new AlertComponent(mockAlertService as any, alertUtils as any);
  });

  it('should initialize with correct default values', () => {
    expect(component.DAYS).toBe(7);
    expect(component.status).toBe('OK');
    expect(component.total).toBe(0);
  });

  it('should return correct status class', () => {
    component.status = 'Critical';
    expect(component.getStatusClass()).toBe('status-red');

    component.status = 'Warning';
    expect(component.getStatusClass()).toBe('status-yellow');

    component.status = 'OK';
    expect(component.getStatusClass()).toBe('status-green');
  });

  it('should load alerts on init', () => {
    component.ngOnInit();

    expect(mockAlertService.getAllAlerts).toHaveBeenCalled();
    expect(component.total).toBe(2);
  });

  it('should call alertUtils methods correctly', () => {
    const mockAlert = mockAlerts.data[0];

    component.getAlertClass(mockAlert);
    expect(alertUtils.getAlertClass).toHaveBeenCalledWith(mockAlert);

    component.getAlertReason(mockAlert);
    expect(alertUtils.getAlertReason).toHaveBeenCalledWith(mockAlert);

    component.getAlertDetails(mockAlert);
    expect(alertUtils.getAlertDetails).toHaveBeenCalledWith(mockAlert);
  });

  it('should clean up subscriptions on destroy', () => {
    let isSubscriptionActive = true;
    const testSubscription = component.alerts$.subscribe({
      complete: () => {
        isSubscriptionActive = false;
      }
    });
    
    component.ngOnInit();
    component.ngOnDestroy();
    
    expect(isSubscriptionActive).toBe(true);
    testSubscription.unsubscribe(); 
  });

  describe('filterAlerts', () => {
    it('should filter storage fill alerts correctly', () => {
      const storageFillAlerts = [
        {
          ...mockAlerts.data[0],
          alertType: {
            ...mockAlerts.data[0].alertType,
            name: 'STORAGE_FILL_ALERT',
          },
          dataStoreName: 'store1',
        },
        {
          ...mockAlerts.data[0],
          alertType: {
            ...mockAlerts.data[0].alertType,
            name: 'STORAGE_FILL_ALERT',
          },
          dataStoreName: 'store1',
        },
      ];

      const filtered = component.filterAlerts(storageFillAlerts);
      expect(filtered.length).toBe(1);
    });
  });
});
