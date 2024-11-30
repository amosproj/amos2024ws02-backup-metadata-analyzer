import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { BackupsComponent } from './backups.component';
import { BackupService } from '../../service/backup-service/backup-service.service';
import { ChartService } from '../../service/chart-service/chart-service.service';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';
import { ClrDatagridStateInterface } from '@clr/angular';
import { Backup } from '../../../shared/types/backup';

describe('BackupsComponent', () => {
  let component: BackupsComponent;
  let mockBackupService: any;
  let mockChartService: any;

  const mockBackups: Backup[] = [
    {
      id: '1',
      sizeMB: 100,
      creationDate: new Date(),
    },
    {
      id: '2',
      sizeMB: 200,
      creationDate: new Date(),
    },
  ];

  beforeEach(() => {
    mockBackupService = {
      getAllBackups: vi.fn().mockReturnValue(
        of({
          data: mockBackups,
          paginationData: { total: 2, offset: 0 },
        })
      ),
    };

    mockChartService = {
      createChart: vi.fn(),
      updateChart: vi.fn(),
      prepareColumnData: vi.fn().mockReturnValue([]),
      preparePieData: vi.fn().mockReturnValue([]),
      updateTimeRange: vi.fn(),
      dispose: vi.fn(),
    };

    component = new BackupsComponent(mockBackupService, mockChartService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Time Range Management', () => {
    it.each([
      ['week', 7],
      ['month', 30],
      ['year', 365],
    ])('should set time range to %s', (range, expectedDaysDiff) => {
      const spy = vi.spyOn(component['timeRangeSubject$'], 'next');
      component.setTimeRange(range as 'week' | 'month' | 'year');

      expect(spy).toHaveBeenCalledOnce();
      const args = spy.mock.calls[0][0];

      expect(args.range).toBe(range);
      expect(args.fromDate).toBeTruthy();
      expect(args.toDate).toBeTruthy();

      const daysDiff =
        (args.toDate.getTime() - args.fromDate.getTime()) / (1000 * 3600 * 24);
      expect(Math.round(daysDiff)).toBe(expectedDaysDiff);
    });
  });

  describe('Filtering and Pagination', () => {
    it('should refresh with pagination state', () => {
      const mockState: ClrDatagridStateInterface = {
        page: {
          size: 20,
          current: 2,
        },
        sort: {
          by: 'creationDate',
          reverse: true,
        },
        filters: [],
      };

      const spy = vi.spyOn(component['filterOptions$'], 'next');
      component.refresh(mockState);

      expect(spy).toHaveBeenCalledOnce();
      const params: BackupFilterParams = spy.mock.calls[0][0];

      expect(params.limit).toBe(20);
      expect(params.offset).toBe(20);
      expect(params.sortOrder).toBe('DESC');
      expect(params.orderBy).toBe('creationDate');
    });

    it('should build filter params with active filters', () => {
      // Setup mock filters
      component.backupDateFilter.ranges = {
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
        fromSizeMB: null,
        toSizeMB: null,
      };
      component.backupSizeFilter.ranges = {
        fromDate: null,
        toDate: null,
        fromSizeMB: 100,
        toSizeMB: 500,
      };

      // Mock isActive to return true
      vi.spyOn(component.backupDateFilter, 'isActive').mockReturnValue(true);
      vi.spyOn(component.backupSizeFilter, 'isActive').mockReturnValue(true);

      const params = component['buildFilterParams']();

      expect(params.fromDate).toBe('2023-01-01');
      expect(params.toDate).toBe('2023-12-31');
      expect(params.fromSizeMB).toBe(100);
      expect(params.toSizeMB).toBe(500);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize with default month time range', () => {
      const timeRangeSpy = vi.spyOn(component, 'setTimeRange');
      component.ngOnInit();

      expect(timeRangeSpy).toHaveBeenCalledWith('month');
    });

    it('should dispose chart service on destroy', () => {
      component.ngOnDestroy();
      expect(mockChartService.dispose).toHaveBeenCalledOnce();
    });
  });

  describe('Observables and Data Flow', () => {
    it('should have correct time ranges', () => {
      expect(component.timeRanges).toEqual(['week', 'month', 'year']);
    });

    it('should map time range subject to range observable', (done) => {
      component.timeRange$.subscribe((range) => {
        expect(range).toBe('month');
      });
    });
  });
});
