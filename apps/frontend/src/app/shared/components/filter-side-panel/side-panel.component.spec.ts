import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SidePanelComponent } from './side-panel.component';
import { BackupService } from '../../services/backup-service/backup-service.service';
import { ChartService } from '../../services/chart-service/chart-service.service';
import { BackupType } from '../../enums/backup.types';
import { of } from 'rxjs';

describe('SidePanelComponent', () => {
  let component: SidePanelComponent;
  let backupService: BackupService;
  let chartService: ChartService;

  beforeEach(() => {
    backupService = {
      getRefreshObservable: vi.fn().mockReturnValue(of(null)),
      getAllBackupTasks: vi.fn().mockReturnValue(of([])),
      getBackupSizesPerDay: vi.fn().mockReturnValue(of([])),
      getGroupedBackupSizes: vi.fn().mockReturnValue(of([])),
    } as any;

    chartService = {
      updateChart: vi.fn(),
      createChart: vi.fn(),
      updateTimeRange: vi.fn(),
      dispose: vi.fn(),
    } as any;

    component = new SidePanelComponent(backupService, chartService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isOpen).toBe(false);
    expect(component.selectedBackupTypes).toEqual([]);
    expect(component.charts).toEqual([]);
  });

  it('should toggle filter panel state', () => {
    expect(component.isOpen).toBe(false);
    component['changeFilterPanelState']();
    expect(component.isOpen).toBe(true);
    component['changeFilterPanelState']();
    expect(component.isOpen).toBe(false);
  });

  it('should set backup types correctly', () => {
    const types = [BackupType.FULL, BackupType.INCREMENTAL];
    component.setBackupTypes(types);
    expect(component.selectedBackupTypes).toEqual(types);
  });

  it('should set time range correctly', () => {
    const range = 'week';
    component.setTimeRange(range as 'week' | 'month' | 'year');
    expect(component['timeRangeSubject$'].getValue().range).toBe(range);
  });

  it('should handle backup task selection', () => {
    const mockTasks = [
      { id: '1', displayName: 'Task 1' },
      { id: '2', displayName: 'Task 2' },
    ];
    component.setBackupTask(mockTasks);
    expect(component.selectedTask).toEqual(mockTasks);
  });

  it('should call loadData on refresh observable', () => {
    const loadDataSpy = vi.spyOn(component, 'loadData');
    component.ngOnInit();
    expect(loadDataSpy).toHaveBeenCalled();
  });

  it('should clean up on destroy', () => {
    const chartServiceSpy = vi.spyOn(chartService, 'dispose');
    component.ngOnDestroy();
    expect(chartServiceSpy).toHaveBeenCalled();
  });
});
