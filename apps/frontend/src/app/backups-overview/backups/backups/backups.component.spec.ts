import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BackupsComponent } from './backups.component';
import { BackupService } from '../../service/backup-service/backup-service.service';
import { ChartService } from '../../service/chart-service/chart-service.service';
import { CustomFilter } from './backupfilter';
import { ClrDatagridStateInterface } from '@clr/angular';
import { APIResponse } from '../../../shared/types/api-response';
import { Backup } from '../../../shared/types/backup';
import { BackupTask } from '../../../shared/types/backup.task';
import { BackupType } from '../../../shared/enums/backup.types';
import { DatePipe } from '@angular/common';

describe('BackupsComponent', () => {
  let component: BackupsComponent;
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
        BackupsComponent,
        { provide: BackupService, useValue: mockBackupService },
        { provide: ChartService, useValue: mockChartService },
        { provide: DatePipe, useValue: { transform: vi.fn() } },
      ],
    });

    component = TestBed.inject(BackupsComponent);
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

  describe('refresh', () => {
    it('should update filter options with pagination and sorting', () => {
      const mockState: ClrDatagridStateInterface<any> = {
        page: { size: 10, current: 2 },
        sort: { by: 'creationDate', reverse: true },
        filters: [],
      };

      const spy = vi.spyOn(component['filterOptions$'], 'next');

      component.refresh(mockState);

      const params = spy.mock.calls[0][0];
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(10);
      expect(params.sortOrder).toBe('DESC');
      expect(params.orderBy).toBe('creationDate');
    });
  });

  describe('buildFilterParams', () => {
    it('should build filter params with active date filter', () => {
      const dateFilter = new CustomFilter('date');
      dateFilter.ranges = {
        fromDate: new Date('2023-01-01').toISOString(),
        toDate: new Date('2023-12-31').toISOString(),
        id: null,
        fromSizeMB: null,
        saveset: null,
        toSizeMB: null,
        taskName: null,
        type: null,
        toScheduledTime: null,
        fromScheduledTime: null,
      };
      (dateFilter.ranges as any)['_isActive'] = true;

      component['backupDateFilter'] = dateFilter;

      const params = component['buildFilterParams']();

      expect(params.fromDate).toBe(dateFilter.ranges.fromDate);
      expect(params.toDate).toBe(dateFilter.ranges.toDate);
    });

    it('should build filter params with active scheduledTime filter', () => {
      const scheduledTimeFilter = new CustomFilter('scheduledTime');
      scheduledTimeFilter.ranges = {
        fromDate: null,
        toDate: null,
        id: null,
        fromSizeMB: null,
        saveset: null,
        toSizeMB: null,
        taskName: null,
        type: null,
        toScheduledTime: new Date('2023-01-01').toISOString(),
        fromScheduledTime: new Date('2023-12-31').toISOString(),
      };
      (scheduledTimeFilter.ranges as any)['_isActive'] = true;

      component['scheduledTimeFilter'] = scheduledTimeFilter;

      const params = component['buildFilterParams']();

      expect(params.fromScheduledDate).toBe(
        scheduledTimeFilter.ranges.fromScheduledTime
      );
      expect(params.toScheduledDate).toBe(scheduledTimeFilter.ranges.toScheduledTime);
    });

    it('should build filter params with active size filter', () => {
      const sizeFilter = new CustomFilter('size');
      sizeFilter.ranges = {
        fromDate: null,
        toDate: null,
        saveset: null,
        fromSizeMB: 100,
        toSizeMB: 500,
        id: null,
        taskName: null,
        type: null,
        toScheduledTime: null,
        fromScheduledTime: null,
      };
      (sizeFilter.ranges as any)['_isActive'] = true;

      component['backupSizeFilter'] = sizeFilter;

      const params = component['buildFilterParams']();

      expect(params.fromSizeMB).toBe(sizeFilter.ranges.fromSizeMB);
      expect(params.toSizeMB).toBe(sizeFilter.ranges.toSizeMB);
    });

    it('should build filter params with active id filter', () => {
      const savesetFilter = new CustomFilter('saveset');
      savesetFilter.ranges = {
        fromDate: null,
        toDate: null,
        fromSizeMB: null,
        saveset: 'saveset',
        toSizeMB: null,
        id: null,
        taskName: null,
        type: null,
        toScheduledTime: null,
        fromScheduledTime: null,
      };
      (savesetFilter.ranges as any)['_isActive'] = true;

      component['backupSavesetFilter'] = savesetFilter;

      const params = component['buildFilterParams']();

      expect(params.saveset).toBe(savesetFilter.ranges.saveset);
    });

    it('should build filter params with active task filter', () => {
      const taskFilter = new CustomFilter('taskName');
      taskFilter.ranges = {
        fromDate: null,
        toDate: null,
        saveset: null,
        fromSizeMB: null,
        toSizeMB: null,
        id: null,
        taskName: 'test',
        type: null,
        toScheduledTime: null,
        fromScheduledTime: null,
      };
      (taskFilter.ranges as any)['_isActive'] = true;

      component['taskFilter'] = taskFilter;

      const params = component['buildFilterParams']();

      expect(params.taskName).toBe(taskFilter.ranges.taskName);
    });

    it('should build filter params with active type filter', () => {
      const typeFilter = new CustomFilter('type');
      typeFilter.ranges = {
        fromDate: null,
        toDate: null,
        saveset: null,
        fromSizeMB: null,
        toSizeMB: null,
        id: null,
        taskName: null,
        type: [BackupType.DIFFERENTIAL],
        toScheduledTime: null,
        fromScheduledTime: null,
      };
      (typeFilter.ranges as any)['_isActive'] = true;

      component['typeFilter'] = typeFilter;

      const params = component['buildFilterParams']();

      expect(params.types).toBe(typeFilter.ranges.type);
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
  describe('Data Fetching and Filtering Integration', () => {
    it('should fetch backups with initial filter', async () => {
      const getAllBackupsSpy = vi.spyOn(mockBackupService, 'getAllBackups');

      component.backups$.subscribe((response) => {
        expect(response.data.length).toBe(2);
        expect(response.paginationData.total).toBe(2);
      });

      expect(getAllBackupsSpy).toHaveBeenCalledWith({ limit: 10 });
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
      expect(component['filterPanel']).toBe(false);

      component['changeFilterPanelState']();
      expect(component['filterPanel']).toBe(true);

      component['changeFilterPanelState']();
      expect(component['filterPanel']).toBe(false);
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

  describe('Loading States', () => {
    it('should manage loading state during refresh', () => {
      const mockState: ClrDatagridStateInterface<any> = {
        page: { size: 10, current: 1 },
      };

      component.refresh(mockState);

      expect(component.loading).toBe(false);
    });
  });
});
