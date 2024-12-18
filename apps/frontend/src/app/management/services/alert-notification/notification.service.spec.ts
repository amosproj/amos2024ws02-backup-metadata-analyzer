import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { of } from 'rxjs';
import { AlertType } from '../../../shared/types/alertType';
import { SeverityType } from '../../../shared/enums/severityType';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpClientMock: {
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };

  const mockBaseUrl = 'http://test-api.com';

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
      patch: vi.fn(),
    };
    service = new NotificationService(
      mockBaseUrl,
      httpClientMock as unknown as HttpClient
    );
  });

  // Unit Tests for getNotificationSettings
  describe('getNotificationSettings', () => {
    it('should fetch notification settings successfully', async () => {
      const mockSettings = [
        {
          id: '1',
          user_active: true,
          name: 'Email Notifications',
        },
      ];

      httpClientMock.get.mockReturnValue(of(mockSettings));

      const result = await service.getNotificationSettings().toPromise();

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/alerting/type`
      );
      expect(result).toEqual(mockSettings);
    });
  });

  // Unit Tests for updateNotificationSettings
  describe('updateNotificationSettings', () => {
    it('should activate user notifications', async () => {
      const mockNotification: AlertType = {
        id: '1',
        user_active: true,
        name: 'Email Notifications',
        severity: SeverityType.INFO,
        master_active: false,
      };

      httpClientMock.patch.mockReturnValue(of(mockNotification));

      const result = await service
        .updateNotificationSettings(mockNotification)
        .toPromise();

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        `${mockBaseUrl}/alerting/type/1/user`,
        { status: mockNotification.user_active }
      );
      expect(result).toEqual(mockNotification);
    });

    it('should deactivate user notifications', async () => {
      const mockNotification: AlertType = {
        id: '1',
        user_active: false,
        name: 'Email Notifications',
        severity: SeverityType.WARNING,
        master_active: false,
      };

      httpClientMock.patch.mockReturnValue(of(mockNotification));

      const result = await service
        .updateNotificationSettings(mockNotification)
        .toPromise();

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        `${mockBaseUrl}/alerting/type/1/user`,
        { status: mockNotification.user_active }
      );
      expect(result).toEqual(mockNotification);
    });
  });

  // Integration-like Test
  describe('Service Integration Scenarios', () => {
    it('should handle complete notification settings workflow', async () => {
      // Mock initial settings fetch
      const initialSettings = [
        {
          id: '1',
          user_active: false,
          name: 'Email Notifications',
          severity: SeverityType.WARNING,
          master_active: false,
        },
      ];
      httpClientMock.get.mockReturnValue(of(initialSettings));

      // Fetch initial settings
      const fetchedSettings = await service
        .getNotificationSettings()
        .toPromise();
      expect(fetchedSettings).toEqual(initialSettings);

      // Update settings
      const updatedNotification: AlertType = {
        ...initialSettings[0],
        user_active: true,
      };
      httpClientMock.patch.mockReturnValue(of(updatedNotification));

      const updatedSettings = await service
        .updateNotificationSettings(updatedNotification)
        .toPromise();
      expect(updatedSettings?.user_active).toBe(true);
    });
  });
});
