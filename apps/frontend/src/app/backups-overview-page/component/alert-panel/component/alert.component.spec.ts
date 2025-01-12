import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { AlertComponent } from './alert.component';
import { of } from 'rxjs';
import {
  Alert,
  SizeAlert,
  StorageFillAlert,
} from '../../../../shared/types/alert';
import { randomUUID } from 'crypto';
import { SeverityType } from '../../../../shared/enums/severityType';
import { BackupType } from '../../../../shared/enums/backup.types';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let mockAlertService: {
    getAllAlerts: Mock;
  };
  let mockDatePipe: {
    transform: Mock;
  };

  beforeEach(() => {
    mockAlertService = {
      getAllAlerts: vi.fn(),
    };

    mockDatePipe = {
      transform: vi.fn(),
    };

    component = new AlertComponent(
      mockAlertService as any,
      mockDatePipe as any
    );
  });

  describe('loadAlerts', () => {
    it('should load and process alerts correctly', () => {
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

  describe('getStatus', () => {
    it('should return OK when no alerts', () => {
      component.alerts = [];
      expect(component.getStatus()).toBe('OK');
    });

    it('should return Critical when critical alerts exist', () => {
      component.alerts = [
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
      ];
      expect(component.getStatus()).toBe('Critical');
    });

    it('should return Warning when non-critical alerts exist', () => {
      component.alerts = [
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
      expect(component.getStatus()).toBe('Warning');
    });
  });

  describe('getStatusClass', () => {
    it('should return correct CSS class for different statuses', () => {
      component.status = 'Critical';
      expect(component.getStatusClass()).toBe('status-red');

      component.status = 'Warning';
      expect(component.getStatusClass()).toBe('status-yellow');

      component.status = 'OK';
      expect(component.getStatusClass()).toBe('status-green');
    });
  });

  describe('getAlertClass', () => {
    it('should return correct alert class based on alert type', () => {
      const criticalAlert: Alert = {
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
      };

      const nonCriticalAlert: Alert = {
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
      };

      expect(component.getAlertClass(criticalAlert)).toBe('alert-red');
      expect(component.getAlertClass(nonCriticalAlert)).toBe('alert-yellow');
    });
  });

  describe('getAlertReason', () => {
    it('should return correct reason for size decreased alert', () => {
      const alert: SizeAlert = {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'SIZE_ALERT',
          severity: SeverityType.WARNING,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 20,
          creationDate: new Date(),
          saveset: 'saveset',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
        size: 20,
        referenceSize: 100,
      };

      expect(component.getAlertReason(alert)).toBe('Size of backup decreased');
    });

    it('should return correct reason for size increased alert', () => {
      const alert: SizeAlert = {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'SIZE_ALERT',
          severity: SeverityType.WARNING,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 100,
          creationDate: new Date(),
          saveset: 'saveset',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
        size: 100,
        referenceSize: 20,
      };

      expect(component.getAlertReason(alert)).toBe('Size of backup increased');
    });
  });

  describe('formatDate', () => {
    it('should format date using DatePipe', () => {
      const testDate = new Date('2023-01-01T12:00:00');
      mockDatePipe.transform.mockReturnValue('01.01.2023 12:00');

      const formattedDate = component.formatDate(testDate);

      expect(mockDatePipe.transform).toHaveBeenCalledWith(
        testDate,
        'dd.MM.yyyy HH:mm'
      );
      expect(formattedDate).toBe('01.01.2023 12:00');
    });

    it('should return empty string if date transformation fails', () => {
      const testDate = new Date('2023-01-01T12:00:00');
      mockDatePipe.transform.mockReturnValue(null);

      const formattedDate = component.formatDate(testDate);

      expect(formattedDate).toBe('');
    });
  });

  describe('filterAlerts', () => {
    it('should filter and sort alerts correctly', () => {
      const alerts: Alert[] = [
        {
          id: randomUUID().toString(),
          alertType: {
            id: randomUUID().toString(),
            name: 'STORAGE_FILL_ALERT',
            severity: SeverityType.CRITICAL,
            user_active: true,
            master_active: true,
          },
          creationDate: new Date('2023-01-01T12:00:00'),
          dataStoreName: 'DataStore1',
          filled: 90,
          highWaterMark: 80,
          capacity: 100,
        } as StorageFillAlert,
        {
          id: randomUUID().toString(),
          alertType: {
            id: randomUUID().toString(),
            name: 'STORAGE_FILL_ALERT',
            severity: SeverityType.WARNING,
            user_active: true,
            master_active: true,
          },
          creationDate: new Date('2023-01-02T12:00:00'),
          dataStoreName: 'DataStore1',
          filled: 85,
          highWaterMark: 80,
          capacity: 100,
        } as StorageFillAlert,
        {
          id: randomUUID().toString(),
          alertType: {
            id: randomUUID().toString(),
            name: 'SIZE_ALERT',
            severity: SeverityType.INFO,
            user_active: true,
            master_active: true,
          },
          backup: {
            id: randomUUID().toString(),
            sizeMB: 0,
            creationDate: new Date('2023-01-03T12:00:00'),
            saveset: 'saveset',
            type: BackupType.DIFFERENTIAL,
          },
          creationDate: new Date('2023-01-03T12:00:00'),
          size: 100,
          referenceSize: 80,
        } as SizeAlert,
      ];

      const filteredAlerts = component.filterAlerts(alerts);

      expect(filteredAlerts.length).toBe(2);
      expect(filteredAlerts[0].creationDate).toEqual(
        new Date('2023-01-03T12:00:00')
      );
      expect(filteredAlerts[1].creationDate).toEqual(
        new Date('2023-01-02T12:00:00')
      );
    });

    it('should only keep the latest STORAGE_FILL_ALERT per data store', () => {
      const alerts: Alert[] = [
        {
          id: randomUUID().toString(),
          alertType: {
            id: randomUUID().toString(),
            name: 'STORAGE_FILL_ALERT',
            severity: SeverityType.CRITICAL,
            user_active: true,
            master_active: true,
          },
          creationDate: new Date('2023-01-01T12:00:00'),
          dataStoreName: 'DataStore1',
          filled: 90,
          highWaterMark: 80,
          capacity: 100,
        } as StorageFillAlert,
        {
          id: randomUUID().toString(),
          alertType: {
            id: randomUUID().toString(),
            name: 'STORAGE_FILL_ALERT',
            severity: SeverityType.WARNING,
            user_active: true,
            master_active: true,
          },
          creationDate: new Date('2023-01-02T12:00:00'),
          dataStoreName: 'DataStore1',
          filled: 85,
          highWaterMark: 80,
          capacity: 100,
        } as StorageFillAlert,
      ];

      const filteredAlerts = component.filterAlerts(alerts);

      expect(filteredAlerts.length).toBe(1);
      expect(filteredAlerts[0].creationDate).toEqual(
        new Date('2023-01-02T12:00:00')
      );
    });
  });
});
