import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BackupsComponent } from './backups.component';
import { BackupService } from '../../service/backup-service/backup-service.service';
import { ChartService } from '../../service/chart-service/chart-service.service';
import { CustomFilter } from './backupfilter';
import { ClrDatagridStateInterface } from '@clr/angular';

describe('BackupsComponent', () => {
  let component: BackupsComponent;
  let mockBackupService: any;
  let mockChartService: any;

  beforeEach(() => {
    mockBackupService = {
      getAllBackups: vi.fn().mockReturnValue(of({ data: [], total: 0 })),
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
        fromSizeMB: null,
        toSizeMB: null,
      };
      (dateFilter.ranges as any)['_isActive'] = true;

      component['backupDateFilter'] = dateFilter;

      const params = component['buildFilterParams']();

      expect(params.fromDate).toBe(dateFilter.ranges.fromDate);
      expect(params.toDate).toBe(dateFilter.ranges.toDate);
    });

    it('should build filter params with active size filter', () => {
      const sizeFilter = new CustomFilter('size');
      sizeFilter.ranges = {
        fromDate: null,
        toDate: null,
        fromSizeMB: 100,
        toSizeMB: 500,
      };
      (sizeFilter.ranges as any)['_isActive'] = true;

      component['backupSizeFilter'] = sizeFilter;

      const params = component['buildFilterParams']();

      expect(params.fromSizeMB).toBe(sizeFilter.ranges.fromSizeMB);
      expect(params.toSizeMB).toBe(sizeFilter.ranges.toSizeMB);
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
});
