import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { AlertComponent } from './alert.component';
import { AlertServiceService } from '../service/alert-service.service';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { Alert } from '../../shared/types/alert';
import { AlertType } from '../../shared/enums/alertType';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let mockAlertService: {
    getAllAlerts: Mock;
    //getAllAlerts: vi.Mock;
    //getAllAlerts: vi.Mock;
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
          id: '1',
          type: AlertType.SIZE_DECREASED,
          value: 50,
          referenceValue: 100,
          backup: {
            id: '1',
            sizeMB: 100,
            creationDate: new Date(),
          },
        },
        {
          id: '2',
          type: AlertType.SIZE_INCREASED,
          value: 150,
          referenceValue: 100,
          backup: {
            id: '2',
            sizeMB: 200,
            creationDate: new Date(),
          },
        },
      ];

      component.criticalAlertTypes = [AlertType.SIZE_DECREASED];
      mockAlertService.getAllAlerts.mockReturnValue(of(mockAlerts));

      component.loadAlerts();

      expect(component.criticalAlertsCount).toBe(1);
      expect(component.nonCriticalAlertsCount).toBe(1);
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
      component.criticalAlertTypes = [AlertType.SIZE_DECREASED];
      component.alerts = [
        {
          id: '1',
          type: AlertType.SIZE_DECREASED,
          value: 50,
          referenceValue: 100,
          backup: {
            id: '1',
            sizeMB: 100,
            creationDate: new Date(),
          },
        },
      ];
      expect(component.getStatus()).toBe('Critical');
    });

    it('should return Warning when non-critical alerts exist', () => {
      component.criticalAlertTypes = [AlertType.SIZE_DECREASED];
      component.alerts = [
        {
          id: '2',
          type: AlertType.SIZE_INCREASED,
          value: 150,
          referenceValue: 100,
          backup: {
            id: '2',
            sizeMB: 200,
            creationDate: new Date(),
          },
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
      component.criticalAlertTypes = [AlertType.SIZE_DECREASED];

      const criticalAlert: Alert = {
        id: '1',
        type: AlertType.SIZE_DECREASED,
        value: 50,
        referenceValue: 100,
        backup: {
          id: '1',
          sizeMB: 100,
          creationDate: new Date(),
        },
      };

      const nonCriticalAlert: Alert = {
        id: '2',
        type: AlertType.SIZE_INCREASED,
        value: 150,
        referenceValue: 100,
        backup: {
          id: '2',
          sizeMB: 200,
          creationDate: new Date(),
        },
      };

      expect(component.getAlertClass(criticalAlert)).toBe('alert-red');
      expect(component.getAlertClass(nonCriticalAlert)).toBe('alert-yellow');
    });
  });

  describe('getAlertReason', () => {
    it('should return correct reason for size decreased alert', () => {
      const alert: Alert = {
        id: '1',
        type: AlertType.SIZE_DECREASED,
        value: 50,
        referenceValue: 100,
        backup: {
          id: '1',
          sizeMB: 100,
          creationDate: new Date(),
        },
      };

      expect(component.getAlertReason(alert)).toBe('Size of backup decreased');
    });

    it('should return correct reason for size increased alert', () => {
      const alert: Alert = {
        id: '1',
        type: AlertType.SIZE_INCREASED,
        value: 50,
        referenceValue: 100,
        backup: {
          id: '1',
          sizeMB: 100,
          creationDate: new Date(),
        },
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
});
