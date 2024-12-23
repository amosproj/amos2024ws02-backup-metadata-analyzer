import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomFilter } from '../backupfilter';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { APIResponse } from '../../../shared/types/api-response';
import { Backup } from '../../../shared/types/backup';
import { BackupService } from '../../../shared/services/backup-service/backup-service.service';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';
import { BackupType } from '../../../shared/enums/backup.types';
import { ClrDatagridSortOrder, ClrDatagridStateInterface } from '@clr/angular';

const INITIAL_FILTER: BackupFilterParams = {
  limit: 10,
};

@Component({
  selector: 'app-backup-table',
  templateUrl: './backup-table.component.html',
  styleUrl: './backup-table.component.css',
})
export class BackupTableComponent implements OnInit, OnDestroy {
  loading = false;
  pageSize = 10;
  backupEnumTypes = Object.keys(BackupType).filter((item) => {
    return isNaN(Number(item));
  });
  //Filters for Table
  protected backupSizeFilter: CustomFilter;
  protected backupDateFilter: CustomFilter;
  protected taskFilter: CustomFilter;
  protected backupSavesetFilter: CustomFilter;
  selectedBackupTypes: string[] = [];
  protected typeFilter: CustomFilter;

  private readonly filterOptions$ = new BehaviorSubject<BackupFilterParams>(
    INITIAL_FILTER
  );

  private readonly destroy$ = new Subject<void>();

  readonly backups$: Observable<APIResponse<Backup>>;

  constructor(private readonly backupService: BackupService) {
    //Initialize filters
    this.backupSizeFilter = new CustomFilter('size');
    this.backupDateFilter = new CustomFilter('date');
    this.backupSavesetFilter = new CustomFilter('saveset');
    this.taskFilter = new CustomFilter('taskName');
    this.typeFilter = new CustomFilter('type');

    //Load all backups and filter them based on the filter options for table
    this.backups$ = this.filterOptions$.pipe(
      switchMap((params) => this.backupService.getAllBackups(params)),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    combineLatest([
      this.backupDateFilter.changes.pipe(startWith(null)),
      this.backupSizeFilter.changes.pipe(startWith(null)),
      this.backupSavesetFilter.changes.pipe(startWith(null)),
      this.taskFilter.changes.pipe(startWith(null)),
      this.typeFilter.changes.pipe(startWith(null)),
    ])
      .pipe(
        map(() => this.buildFilterParams()),
        takeUntil(this.destroy$)
      )
      .subscribe((params) => this.filterOptions$.next(params));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set filter options for the backup table
   * @returns Filter options
   */
  private buildFilterParams(): BackupFilterParams {
    const params: BackupFilterParams = { ...INITIAL_FILTER };

    if (this.backupDateFilter.isActive()) {
      params.fromDate = this.backupDateFilter.ranges.fromDate;
      params.toDate = this.backupDateFilter.ranges.toDate;
    }

    if (this.backupSizeFilter.isActive()) {
      params.fromSizeMB = this.backupSizeFilter.ranges.fromSizeMB;
      params.toSizeMB = this.backupSizeFilter.ranges.toSizeMB;
    }

    if (this.backupSavesetFilter.isActive()) {
      params.saveset = this.backupSavesetFilter.ranges.saveset;
    }

    if (this.taskFilter.isActive()) {
      params.taskName = this.taskFilter.ranges.taskName;
    }

    if (this.typeFilter.isActive()) {
      params.types = this.typeFilter.ranges.type;
    }

    return params;
  }

  setBackupTypes(types: BackupType[]): void {
    this.selectedBackupTypes = types;
    this.typeFilter.updateRanges({ type: types });
  }

  /**
   * Check the filter states and add new filter values to the filterOptions$ subject
   * @param state filter values
   */
  refresh(state: ClrDatagridStateInterface<any>): void {
    this.loading = true;

    const params: BackupFilterParams = {
      ...INITIAL_FILTER,
      limit: state.page?.size ?? this.pageSize,
      offset: state.page?.current
        ? (state.page.current - 1) * (state.page?.size ?? this.pageSize)
        : 0,
      sortOrder: state.sort?.reverse ? 'DESC' : 'ASC',
      orderBy: state.sort?.by ? state.sort.by.toString() : 'creationDate',
    };

    if (state.filters) {
      Object.assign(params, this.buildFilterParams());
    }

    this.filterOptions$.next(params);
    this.loading = false;
  }

  protected readonly ClrDatagridSortOrder = ClrDatagridSortOrder;
}
