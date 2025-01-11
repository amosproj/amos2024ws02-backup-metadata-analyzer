import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { AlertComponent } from './alert.component';
import { of } from 'rxjs';
import { Alert, SizeAlert } from '../../../../shared/types/alert';
import { randomUUID } from 'crypto';
import { SeverityType } from '../../../../shared/enums/severityType';
import { BackupType } from '../../../../shared/enums/backup.types';
import { AlertUtilsService } from '../../../../shared/utils/alertUtils';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let alertUtils: AlertUtilsService;
  let mockAlertService: {
    getAllAlerts: Mock;
  };

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

  beforeEach(() => {
    mockAlertService = {
      getAllAlerts: vi.fn(),
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
    expect(component.alerts).toEqual([]);
    expect(component.status).toBe('OK');
    expect(component.DAYS).toBe(7);
  });

  it('should return correct status class', () => {
    component.status = 'Critical';
    expect(component.getStatusClass()).toBe('status-red');

    component.status = 'Warning';
    expect(component.getStatusClass()).toBe('status-yellow');

    component.status = 'OK';
    expect(component.getStatusClass()).toBe('status-green');
  });

  it('should determine correct status based on alerts', () => {
    component.alerts = mockAlerts;
    expect(component.getStatus()).toBe('Critical');

    component.alerts = mockAlerts.filter(
      (a) => a.alertType.severity !== SeverityType.CRITICAL
    );
    expect(component.getStatus()).toBe('Warning');

    component.alerts = mockAlerts.filter(
      (a) => a.alertType.severity === SeverityType.INFO
    );
    expect(component.getStatus()).toBe('OK');
  });

  it('should call alertUtils methods correctly', () => {
    const mockAlert = mockAlerts[0];

    component.getAlertClass(mockAlert);
    expect(alertUtils.getAlertClass).toHaveBeenCalledWith(mockAlert);

    component.getAlertReason(mockAlert);
    expect(alertUtils.getAlertReason).toHaveBeenCalledWith(mockAlert);

    component.getAlertDetails(mockAlert);
    expect(alertUtils.getAlertDetails).toHaveBeenCalledWith(mockAlert);
  });

  it('should clean up subscriptions on destroy', () => {
    const destroySpy = vi.spyOn(component['destroy$'], 'next');
    const completeSpy = vi.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  describe('loadAlerts', () => {
    it('should load and process alerts correctly', () => {
      mockAlertService.getAllAlerts.mockReturnValue(of(mockAlerts));

      component.loadAlerts();

      expect(component.criticalAlertsCount).toBe(1);
      expect(component.infoAlertsCount).toBe(1);
      expect(component.warningAlertsCount).toBe(1);
      expect(component.status).toBe('Critical');
    });

    it('should set status to OK when no alerts', () => {
      mockAlertService.getAllAlerts.mockReturnValue(of([]));

      component.loadAlerts();

      expect(component.alerts.length).toBe(0);
      expect(component.status).toBe('OK');
    });
  });
});
