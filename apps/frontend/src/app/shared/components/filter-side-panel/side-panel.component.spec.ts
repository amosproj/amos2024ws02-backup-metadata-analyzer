import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SidePanelComponent } from './side-panel.component';
import { BackupType } from '../../enums/backup.types';
import { ChartService } from '../../charts/chart-service/chart-service.service';
import { BackupService } from '../../services/backup-service/backup-service.service';
import { of } from 'rxjs';

describe('SidePanelComponent', () => {
  let component: SidePanelComponent;
  let backupService: BackupService;
  let chartService: ChartService;

  const mockBackupService = {
    getAllBackupTasks: vi.fn(),
    getBackupSizesPerDay: vi.fn(),
    getGroupedBackupSizes: vi.fn(),
    getBackupAlertSeverityOverview: vi.fn(),
    getRefreshObservable: vi.fn()
  };

  const mockChartService = {
    updateChart: vi.fn(),
    createChart: vi.fn(),
    updateTimeRange: vi.fn(),
    dispose: vi.fn()
  };

  beforeEach(() => {
    backupService = mockBackupService as unknown as BackupService;
    chartService = mockChartService as unknown as ChartService;
    
    mockBackupService.getRefreshObservable.mockReturnValue(of(null));
    mockBackupService.getAllBackupTasks.mockReturnValue(of([]));
    mockBackupService.getBackupSizesPerDay.mockReturnValue(of([]));
    mockBackupService.getGroupedBackupSizes.mockReturnValue(of([]));
    mockBackupService.getBackupAlertSeverityOverview.mockReturnValue(of({
      ok: 0,
      info: 0,
      warning: 0,
      critical: 0
    }));

    component = new SidePanelComponent(backupService, chartService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isOpen).toBe(false);
    expect(component.selectedBackupTypes).toEqual([]);
    expect(component.selectedTask).toEqual([]);
  });

  it('should set time range correctly', () => {
    component.setTimeRange('week');
    expect(component['timeRangeSubject$'].getValue().range).toBe('week');

    component.setTimeRange('month');
    expect(component['timeRangeSubject$'].getValue().range).toBe('month');

    component.setTimeRange('year');
    expect(component['timeRangeSubject$'].getValue().range).toBe('year');
  });

  it('should set backup types correctly', () => {
    const types = [BackupType.FULL, BackupType.INCREMENTAL];
    component.setBackupTypes(types);
    expect(component.selectedBackupTypes).toEqual(types);
  });

  it('should toggle filter panel state', () => {
    expect(component.isOpen).toBe(false);
    component['changeFilterPanelState']();
    expect(component.isOpen).toBe(true);
    component['changeFilterPanelState']();
    expect(component.isOpen).toBe(false);
  });

  it('should call loadData on init', () => {
    const loadDataSpy = vi.spyOn(component, 'loadData');
    component.ngOnInit();
    expect(loadDataSpy).toHaveBeenCalled();
  });

  it('should clean up on destroy', () => {
    component.ngOnDestroy();
    expect(chartService.dispose).toHaveBeenCalled();
  });

  it('should handle backup task search', () => {
    const searchTerm = 'test';
    component.onSearchInput(searchTerm);
    expect(component['backupTaskSearchTerm$']).toBeTruthy();
  });
});
