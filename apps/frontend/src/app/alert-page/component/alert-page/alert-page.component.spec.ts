import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertPageComponent } from './alert-page.component';
import { AlertServiceService } from '../../../shared/services/alert-service/alert-service.service';
import { AlertUtilsService } from '../../../shared/utils/alertUtils';
import { SeverityType } from '../../../shared/enums/severityType';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Alert } from '../../../shared/types/alert';
import { randomUUID } from 'node:crypto';
import { BackupType } from '../../../shared/enums/backup.types';

describe('AlertPageComponent', () => {
  let component: AlertPageComponent;
  let fixture: ComponentFixture<AlertPageComponent>;
  let alertService: AlertServiceService;
  let alertUtils: AlertUtilsService;

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

  const mockAlertUtils = {
    getAlertClass: vi.fn(),
    formatDate: vi.fn(),
    getAlertReason: vi.fn(),
    getAlertDetails: vi.fn(),
  };

  beforeEach(async () => {
    mockAlertService.getAllAlerts.mockReturnValue(of(mockAlerts));
    mockAlertService.getRefreshObservable.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      declarations: [AlertPageComponent],
      providers: [
        { provide: AlertServiceService, useValue: mockAlertService },
        { provide: AlertUtilsService, useValue: mockAlertUtils },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertPageComponent);
    component = fixture.componentInstance;
    alertService = TestBed.inject(AlertServiceService);
    alertUtils = TestBed.inject(AlertUtilsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load alerts on init', () => {
    expect(mockAlertService.getAllAlerts).toHaveBeenCalledWith();
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading alerts fails', () => {
    mockAlertService.getAllAlerts.mockReturnValue(
      throwError(() => new Error('Network error'))
    );
    component.ngOnInit();
    expect(component.error).toBe(
      'Failed to load alerts. Please try again later.'
    );
    expect(component.loading).toBe(false);
  });

  it('should calculate alert summary correctly', () => {
    component.alerts$.subscribe((alerts) => {
      expect(alerts).toEqual(mockAlerts);
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

  it('should clean up subscriptions on destroy', () => {
    const destroySpy = vi.spyOn(component['destroy$'], 'next');
    const completeSpy = vi.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
