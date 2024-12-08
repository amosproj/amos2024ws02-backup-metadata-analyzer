import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { NotificationSettingsComponent } from './notification-settings.component';

describe('NotificationSettingsComponent', () => {
  let component: NotificationSettingsComponent;
  let mockNotificationService: {
    getNotificationSettings: ReturnType<typeof vi.fn>;
    updateNotificationSettings: ReturnType<typeof vi.fn>;
  };
  let mockAlertService: {
    getAllAlerts: ReturnType<typeof vi.fn>;
    refreshAlerts: ReturnType<typeof vi.fn>;
    getRefreshObservable: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  };
  let mockFormBuilder: FormBuilder;

  const mockNotificationSettings = [
    {
      id: '1',
      name: 'Test Notification',
      severity: 'high',
      user_active: true,
      master_active: false,
    },
  ];

  beforeEach(() => {
    mockNotificationService = {
      getNotificationSettings: vi.fn(),
      updateNotificationSettings: vi.fn(),
    };
    mockAlertService = {
      getAllAlerts: vi.fn(),
      refreshAlerts: vi.fn(),
      getRefreshObservable: vi.fn(),
      refresh: vi.fn(),
    };

    mockFormBuilder = new FormBuilder();

    component = new NotificationSettingsComponent(
      mockNotificationService as any,
      mockAlertService as any,
      mockFormBuilder
    );
  });

  describe('Unit Tests', () => {
    it('should initialize with default state', () => {
      expect(component.isLoading).toBe(false);
      expect(component.isSaving).toBe(false);
      expect(component.isOpen).toBe(false);
      expect(component.settingsForm).toBeDefined();
    });

    it('should open and close modal correctly', () => {
      component.open();
      expect(component.isOpen).toBe(true);

      component.close();
      expect(component.isOpen).toBe(false);
    });

    it('should load notification settings successfully', () => {
      mockNotificationService.getNotificationSettings.mockReturnValue(
        of(mockNotificationSettings)
      );

      component.loadNotificationSettings();

      expect(component.isLoading).toBe(false);
      expect(component.notificationControls.length).toBe(1);
    });

    it('should handle error when loading notification settings', () => {
      mockNotificationService.getNotificationSettings.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );

      component.loadNotificationSettings();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should save notification settings successfully', () => {
      mockNotificationService.getNotificationSettings.mockReturnValue(
        of(mockNotificationSettings)
      );
      mockNotificationService.updateNotificationSettings.mockReturnValue(
        of(mockNotificationSettings)
      );

      component.loadNotificationSettings();

      const notificationControl = component.notificationControls.at(0);
      notificationControl.patchValue({ user_active: false });

      component.saveSettings();

      expect(component.isLoading).toBe(false);
      expect(component.isOpen).toBe(false);
    });

    it('should handle save settings error', () => {
      mockNotificationService.getNotificationSettings.mockReturnValue(
        of(mockNotificationSettings)
      );
      mockNotificationService.updateNotificationSettings.mockReturnValue(
        throwError(() => new Error('Save failed'))
      );

      component.loadNotificationSettings();

      const notificationControl = component.notificationControls.at(0);
      notificationControl.patchValue({ user_active: false });

      component.saveSettings();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Lifecycle Tests', () => {
    it('should clean up on component destroy', () => {
      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      const completeDestroySpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component.isOpen).toBe(false);
      expect(destroySpy).toHaveBeenCalled();
      expect(completeDestroySpy).toHaveBeenCalled();
    });
  });
});
