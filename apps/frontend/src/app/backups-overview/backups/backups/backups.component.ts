import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { BackupService } from '../../service/backup-service/backup-service.service';
import { Backup } from '../../../shared/types/backup';
import { ClrDatagridSortOrder, ClrDatagridStateInterface } from '@clr/angular';
import { CustomFilter } from './backupfilter';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';
import { ChartService } from '../../service/chart-service/chart-service.service';
import { APIResponse } from '../../../shared/types/api-response';
import { BackupTask } from '../../../shared/types/backup.task';
import e from 'cors';

const INITIAL_FILTER: BackupFilterParams = {
  limit: 10,
};

interface TimeRangeConfig {
  fromDate: Date;
  toDate: Date;
  range: 'week' | 'month' | 'year';
}

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit, OnDestroy, OnInit {
  protected readonly ClrDatagridSortOrder = ClrDatagridSortOrder;
  private readonly timeRangeSubject$ = new BehaviorSubject<TimeRangeConfig>({
    fromDate: new Date(),
    toDate: new Date(),
    range: 'month',
  });

  backupTasks$: Observable<BackupTask[]>;
  private readonly backupTaskSubject$ = new BehaviorSubject<
    BackupTask | undefined
  >(undefined);

  timeRanges: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];
  readonly timeRange$ = this.timeRangeSubject$.pipe(
    map((config) => config.range)
  );

  private filterOptions$ = new BehaviorSubject<BackupFilterParams>(
    INITIAL_FILTER
  );

  tasksLoading: boolean = false;
  loading: boolean = false;
  pageSize = 10;
  protected backupSizeFilter: CustomFilter;
  protected backupDateFilter: CustomFilter;
  protected backupIdFilter: CustomFilter;
  protected selectedTask: BackupTask | undefined;
  protected filterPanel: boolean = false;
  taskFilter: CustomFilter;

  tasks: BackupTask[] = [
    { id: '1', name: 'Task 1' },
    { id: '2', name: 'Task 2' },
    { id: '3', name: 'Task 3' },
    { id: '4', name: 'Task 4' },
    { id: '5', name: 'Task 5' },
    { id: '6', name: 'Task 6' },
  ];

  readonly backups$: Observable<APIResponse<Backup>>;
  readonly chartBackups$: Observable<APIResponse<Backup>>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly backupService: BackupService,
    private readonly chartService: ChartService
  ) {
    this.backupSizeFilter = new CustomFilter('size');
    this.backupDateFilter = new CustomFilter('date');
    this.backupIdFilter = new CustomFilter('id');
    this.taskFilter = new CustomFilter('taskName');

    this.backups$ = this.filterOptions$.pipe(
      switchMap((params) => this.backupService.getAllBackups(params)),
      takeUntil(this.destroy$)
    );

    this.backupTasks$ = this.backupTaskSubject$
      .pipe(takeUntil(this.destroy$))
      .pipe(
        tap(() => (this.tasksLoading = true)),
        switchMap((task) => of(this.tasks)),
        tap(() => (this.tasksLoading = false))
      );

    this.chartBackups$ = combineLatest([
      this.timeRangeSubject$.pipe(
        distinctUntilChanged(
          (prev, curr) =>
            prev.range === curr.range &&
            prev.fromDate.getTime() === curr.fromDate.getTime() &&
            prev.toDate.getTime() === curr.toDate.getTime()
        )
      ),
      this.backupTaskSubject$.pipe(
        // Add debug logging
        tap((task) => console.log('Task subject emitted:', task)),
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
      ),
    ]).pipe(
      // Add debug logging for combined emissions
      tap(([timeRange, task]) => {
        console.log('Combined emission:', {
          timeRange: timeRange.range,
          taskId: task?.id,
        });
      }),
      map(([{ fromDate, toDate }, task]) => ({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        taskId: task?.id,
      })),
      tap((params) => console.log('Calling API with params:', params)),
      switchMap((params) => this.backupService.getAllBackups(params)),
      tap({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            const currentRange = this.timeRangeSubject$.getValue().range;

            // Update timeline chart
            const columnData = this.chartService.prepareColumnData(
              response.data,
              currentRange
            );
            this.chartService.updateChart('backupTimelineChart', columnData);

            // Update size distribution chart
            const pieData = this.chartService.preparePieData(response.data);
            this.chartService.updateChart('backupSizeChart', pieData);

            console.log('Charts updated successfully:', {
              timeRange: currentRange,
              dataLength: response.data.length,
            });
          } else {
            console.warn('No data received for charts');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating charts:', error);
          this.loading = false;
        },
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    combineLatest([
      this.backupDateFilter.changes.pipe(startWith(null)),
      this.backupSizeFilter.changes.pipe(startWith(null)),
      this.backupIdFilter.changes.pipe(startWith(null)),
      this.taskFilter.changes.pipe(startWith(null)),
    ])
      .pipe(
        map(() => this.buildFilterParams()),
        takeUntil(this.destroy$)
      )
      .subscribe((params) => this.filterOptions$.next(params));

    this.setTimeRange('month');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.chartService.createChart(
        {
          id: 'backupSizeChart',
          type: 'pie',
          valueField: 'value',
          categoryField: 'category',
          seriesName: 'SizeDistribution',
        },
        this.chartBackups$.pipe(
          map((response: APIResponse<Backup>) => response.data)
        )
      );
      this.chartService.createChart(
        {
          id: 'backupTimelineChart',
          type: 'column',
          valueYField: 'sizeMB',
          valueXField: 'creationDate',
          seriesName: 'BackupSize',
          tooltipText:
            "[bold]{valueY}[/] MB\n{valueX.formatDate('yyyy-MM-dd HH:mm')}\nBackups: {count}",
        },
        this.chartBackups$.pipe(
          map((response: APIResponse<Backup>) => response.data)
        ),
        this.timeRangeSubject$.getValue().range
      );
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chartService.dispose();
  }

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

    if (this.backupIdFilter.isActive()) {
      params.id = this.backupIdFilter.ranges.id;
    }

    if (this.taskFilter.isActive()) {
      params.taskName = this.taskFilter.ranges.taskName;
    }

    return params;
  }

  setTimeRange(range: 'week' | 'month' | 'year'): void {
    const toDate = new Date();
    const fromDate = new Date();

    switch (range) {
      case 'week':
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case 'month':
        fromDate.setMonth(fromDate.getMonth() - 1);
        break;
      case 'year':
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        break;
    }

    this.timeRangeSubject$.next({
      fromDate,
      toDate,
      range,
    });
    this.chartService.updateTimeRange('backupTimelineChart', range);
  }

  setBackupTask(task: BackupTask | undefined): void {
    this.selectedTask = task;
    if (task) {
      this.backupTaskSubject$.next(task);
    } else {
      this.backupTaskSubject$.next(undefined);
    }

    console.log('update subject', task);
    //his.chartService.updateChart('backupTimelineChart', this.chartBackups$);
  }

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

  protected changeFilterPanelState(): void {
    if (this.filterPanel) {
      this.filterPanel = false;
    } else {
      this.filterPanel = true;
    }
  }
}
