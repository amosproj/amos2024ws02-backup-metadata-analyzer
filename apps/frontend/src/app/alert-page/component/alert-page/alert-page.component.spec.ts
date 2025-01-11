import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertPageComponent } from './alert-page.component';
import { AlertServiceService } from '../../../shared/services/alert-service/alert-service.service';
import { AlertUtilsService } from '../../../shared/utils/alertUtils';
import { SeverityType } from '../../../shared/enums/severityType';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Alert } from '../../../shared/types/alert';

describe('AlertPageComponent', () => {
  let component: AlertPageComponent;
  let fixture: ComponentFixture<AlertPageComponent>;
  let alertService: AlertServiceService;
  let alertUtils: AlertUtilsService;

  const mockAlerts = [
    {
      id: '1',
      timestamp: new Date(),
      alertType: {
        name: 'STORAGE_FILL_ALERT',
        severity: SeverityType.CRITICAL,
      },
      message: 'Critical storage alert',
    },
    {
      id: '2',
      timestamp: new Date(),
      alertType: {
        name: 'BACKUP_ALERT',
        severity: SeverityType.WARNING,
      },
      message: 'Warning backup alert',
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
    expect(mockAlertService.getAllAlerts).toHaveBeenCalledWith(30);
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
      expect(summary.totalCount).toBe(2);
    });
  });

  it('should identify StorageFillAlert correctly', () => {
    const storageFillAlert: Alert = {
      ...mockAlerts[0],
      creationDate: new Date(),
      alertType: {
        ...mockAlerts[0].alertType,
        id: 'someId',
        user_active: true,
        master_active: true,
      },
    };
    expect(component.isStorageFillAlert(storageFillAlert)).toBe(true);
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
