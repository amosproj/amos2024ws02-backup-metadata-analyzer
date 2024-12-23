import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BackupTableComponent } from './backup-table.component';
import { Backup } from '../../../shared/types/backup';
import { APIResponse } from '../../../shared/types/api-response';
import { BackupType } from '../../../shared/enums/backup.types';
import { BackupService } from '../../../shared/services/backup-service/backup-service.service';
import { ClrDatagridStateInterface } from '@clr/angular';
import { CustomFilter } from '../backupfilter';

describe('BackupTableComponent', () => {
  let component: BackupTableComponent;
  let mockBackupService: any;
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
    };

    TestBed.configureTestingModule({
      providers: [
        BackupTableComponent,
        { provide: BackupService, useValue: mockBackupService },
      ],
    });

    component = TestBed.inject(BackupTableComponent);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
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
        saveset: null,
        fromSizeMB: 100,
        toSizeMB: 500,
        id: null,
        taskName: null,
        type: null,
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
      };
      (typeFilter.ranges as any)['_isActive'] = true;

      component['typeFilter'] = typeFilter;

      const params = component['buildFilterParams']();

      expect(params.types).toBe(typeFilter.ranges.type);
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
