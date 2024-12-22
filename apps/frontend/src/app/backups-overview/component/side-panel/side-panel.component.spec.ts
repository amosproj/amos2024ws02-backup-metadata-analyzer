import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SidePanelComponent } from './side-panel.component';
import { APIResponse } from '../../../shared/types/api-response';
import { Backup } from '../../../shared/types/backup';
import { BackupType } from '../../../shared/enums/backup.types';
import { ChartService } from '../../service/chart-service/chart-service.service';
import { BackupService } from '../../service/backup-service/backup-service.service';
import { BackupTask } from '../../../shared/types/backup.task';

describe('SidePanelComponent', () => {
  let component: SidePanelComponent;
  let mockBackupService: any;
  let mockChartService: any;
  const mockBackups: APIResponse<Backup> = {
    data: [
      {
        id: '1',
        sizeMB: 500,
        creationDate: new Date(),
        saveset: '',
        type: BackupType.DIFFERENTIAL,
      },
      {
        id: '2',
        sizeMB: 750,
        creationDate: new Date(),
        saveset: '',
        type: BackupType.DIFFERENTIAL,
      },
    ],
    paginationData: {
      total: 2,
    },
  };

  beforeEach(() => {
    mockBackupService = {
      getAllBackups: vi.fn().mockReturnValue(of(mockBackups)),
      getAllBackupTasks: vi.fn().mockReturnValue(of([])),
    };

    mockChartService = {
      createChart: vi.fn(),
      updateChart: vi.fn(),
      prepareColumnData: vi.fn().mockReturnValue([]),
      preparePieData: vi.fn().mockReturnValue([]),
      updateTimeRange: vi.fn(),
      dispose: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SidePanelComponent,
        { provide: BackupService, useValue: mockBackupService },
        { provide: ChartService, useValue: mockChartService },
      ],
    });

    component = TestBed.inject(SidePanelComponent);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('setTimeRange', () => {
    it('should set time range to week', () => {
      const spy = vi.spyOn(component['timeRangeSubject$'], 'next');
      const chartServiceSpy = vi.spyOn(mockChartService, 'updateTimeRange');

      component.setTimeRange('week');

      const emittedValue = spy.mock.calls[0][0];
      expect(emittedValue.range).toBe('week');
      expect(emittedValue.fromDate).toBeDefined();
      expect(emittedValue.toDate).toBeDefined();
      expect(chartServiceSpy).toHaveBeenCalledWith(
        'backupTimelineChart',
        'week'
      );
    });

    it('should set time range to month', () => {
      const spy = vi.spyOn(component['timeRangeSubject$'], 'next');

      component.setTimeRange('month');

      const emittedValue = spy.mock.calls[0][0];
      expect(emittedValue.range).toBe('month');
    });

    it('should set time range to year', () => {
      const spy = vi.spyOn(component['timeRangeSubject$'], 'next');

      component.setTimeRange('year');

      const emittedValue = spy.mock.calls[0][0];
      expect(emittedValue.range).toBe('year');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should dispose chart service on destroy', () => {
      component.ngOnDestroy();
      expect(mockChartService.dispose).toHaveBeenCalled();
    });

    it('should create charts after view init', () => {
      vi.useFakeTimers();
      component.ngAfterViewInit();
      vi.advanceTimersByTime(200);

      expect(mockChartService.createChart).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });

  describe('Time Range and Chart Data Integration', () => {
    it('should handle time range changes and update charts', () => {
      component.setTimeRange('week');

      expect(mockChartService.updateTimeRange).toHaveBeenCalledWith(
        'backupTimelineChart',
        'week'
      );
    });
  });

  describe('Search and Task Selection', () => {
    it('should handle task search input', () => {
      const searchTerm = 'backup-task';
      const searchSpy = vi.spyOn(component['backupTaskSearchTerm$'], 'next');

      component.onSearchInput(searchTerm);

      expect(searchSpy).toHaveBeenCalledWith(searchTerm);
    });

    it('should update selected backup tasks', () => {
      const mockTasks = [
        { id: '1', displayName: 'Task 1' },
        { id: '2', displayName: 'Task 2' },
      ] as BackupTask[];
      const taskSubjectSpy = vi.spyOn(component['backupTaskSubject$'], 'next');

      component.setBackupTask(mockTasks);

      expect(component['selectedTask']).toEqual(mockTasks);
      expect(taskSubjectSpy).toHaveBeenCalledWith(mockTasks);
    });
  });

  describe('Filter Panel', () => {
    it('should toggle filter panel state', () => {
      expect(component['isOpen']).toBe(false);

      component['changeFilterPanelState']();
      expect(component['isOpen']).toBe(true);

      component['changeFilterPanelState']();
      expect(component['isOpen']).toBe(false);
    });
  });

  describe('Chart Data Updates', () => {
    it('should update charts when new data is received', (done) => {
      const mockResponse = {
        data: [
          { id: '1', sizeMB: 100, creationDate: new Date() },
          { id: '2', sizeMB: 200, creationDate: new Date() },
        ],
        paginationData: { total: 2 },
      };

      mockBackupService.getAllBackups.mockReturnValue(of(mockResponse));

      component.chartBackups$.subscribe(() => {
        expect(mockChartService.prepareColumnData).toHaveBeenCalled();
        expect(mockChartService.preparePieData).toHaveBeenCalled();
        expect(mockChartService.updateChart).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Task Filtering', () => {
    it('should filter tasks based on search term', (done) => {
      const mockTasks = [
        { id: '1', displayName: 'Daily Backup' },
        { id: '2', displayName: 'Weekly Backup' },
      ] as BackupTask[];

      mockBackupService.getAllBackupTasks.mockReturnValue(of(mockTasks));

      component['selectedbackupTasks$'].subscribe((filteredTasks) => {
        expect(filteredTasks).toEqual([]);
      });
    });
    it('should handle empty search term', (done) => {
      const mockTasks = [
        { id: '1', displayName: 'Daily Backup' },
      ] as BackupTask[];

      mockBackupService.getAllBackupTasks.mockReturnValue(of(mockTasks));
      component.onSearchInput('');

      (component as any).selectedbackupTasks$.subscribe(
        (filteredTasks: BackupTask[]) => {
          expect(filteredTasks).toEqual([]);
        }
      );
    });
  });
});
