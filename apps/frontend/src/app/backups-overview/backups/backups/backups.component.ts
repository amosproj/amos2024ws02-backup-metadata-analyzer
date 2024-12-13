import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
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
import { BackupType } from '../../../shared/enums/backup.types';

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

  protected timeRanges: ('week' | 'month' | 'year')[] = [
    'week',
    'month',
    'year',
  ];
  tasksLoading: boolean = false;
  loading: boolean = false;
  pageSize = 10;
  protected backupSizeFilter: CustomFilter;
  protected backupDateFilter: CustomFilter;
  protected selectedTask: BackupTask[] = [];
  protected filterPanel: boolean = false;
  protected backupSavesetFilter: CustomFilter;
  protected taskFilter: CustomFilter;
  backupEnumTypes = Object.keys(BackupType).filter((item) => {
    return isNaN(Number(item));
  });
  selectedtBackupTypes: string[] = [];

  //Subjects
  private readonly timeRangeSubject$ = new BehaviorSubject<TimeRangeConfig>({
    fromDate: new Date(),
    toDate: new Date(),
    range: 'month',
  });
  readonly timeRange$ = this.timeRangeSubject$.pipe(
    map((config) => config.range)
  );

  protected backupTaskSearchTerm$: Subject<string> = new Subject<string>();

  readonly backupTaskSubject$ = new BehaviorSubject<BackupTask[]>([]);
  readonly backupTypesSubject$ = new BehaviorSubject<BackupType[]>([]);
  private filterOptions$ = new BehaviorSubject<BackupFilterParams>(
    INITIAL_FILTER
  );
  private readonly destroy$ = new Subject<void>();

  //Observables
  readonly backups$: Observable<APIResponse<Backup>>;
  readonly chartBackups$: Observable<APIResponse<Backup>>;
  allBackupTasks$: Observable<BackupTask[]>;
  protected selectedbackupTasks$: Observable<BackupTask[]>;

  constructor(
    private readonly backupService: BackupService,
    private readonly chartService: ChartService
  ) {
    this.backupSizeFilter = new CustomFilter('size');
    this.backupDateFilter = new CustomFilter('date');
    this.backupSavesetFilter = new CustomFilter('saveset');
    this.taskFilter = new CustomFilter('taskName');

    /**
     * Load all backups and filter them based on the filter options for table
     */
    this.backups$ = this.filterOptions$.pipe(
      switchMap((params) => this.backupService.getAllBackups(params)),
      takeUntil(this.destroy$)
    );

    /**
     * Load all backups and filter them based on the filter options for charts
     */
    this.allBackupTasks$ = this.backupService
      .getAllBackupTasks()
      .pipe(takeUntil(this.destroy$), shareReplay(1));

    this.selectedbackupTasks$ = combineLatest([
      this.allBackupTasks$,
      this.backupTaskSearchTerm$.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      ),
    ]).pipe(
      map(([tasks, searchTerm]) => {
        if (!searchTerm) {
          return [];
        }

        const term = searchTerm.toLowerCase();
        return tasks.filter((task) =>
          task.displayName.toLowerCase().includes(term)
        );
      })
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
        distinctUntilChanged((prev, curr) => {
          if (!prev && !curr) return true;
          if (!prev || !curr) return false;
          if (prev.length !== curr.length) {
            return false;
          }
          const prevIds = prev.map((p) => p.id).sort();
          const currIds = curr.map((c) => c.id).sort();

          return prevIds === currIds;
        })
      ),
    ]).pipe(
      map(([timeRange, tasks]) => ({
        params: {
          fromDate: timeRange.fromDate.toISOString(),
          toDate: timeRange.toDate.toISOString(),
        },
        selectedTasks: tasks ? tasks.map((task) => task.id) : [],
      })),
      switchMap(({ params, selectedTasks }) =>
        this.backupService.getAllBackups(params, selectedTasks)
      ),
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
      this.backupSavesetFilter.changes.pipe(startWith(null)),
      this.taskFilter.changes.pipe(startWith(null)),
    ])
      .pipe(
        map(() => this.buildFilterParams()),
        takeUntil(this.destroy$)
      )
      .subscribe((params) => this.filterOptions$.next(params));

    this.setTimeRange('month');
  }

  /**
   * Initialize the charts
   */
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

  /**
   * Set filter options for the backup datagrid
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

    return params;
  }

  /**
   * Set time range for the charts
   * @param range time range for the charts
   */
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
  /**
   * Set selected Backup task to filter the charts
   * @param tasks selected Backup task
   */
  setBackupTask(tasks: BackupTask[]): void {
    this.selectedTask = tasks;
    this.backupTaskSubject$.next(tasks);
  }

  setBackupTypes(types: BackupType[]): void {
    this.selectedtBackupTypes = types;
    this.backupTypesSubject$.next(types);
  }


  /**
   * Add search Term to backupTaskSearchTerm$ subject for the Backup task search
   * @param term Search term for the Backup task
   */
  onSearchInput(term: string): void {
    this.backupTaskSearchTerm$.next(term);
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
  /**
   * Change the state of the filter panel to open or close it
   */
  protected changeFilterPanelState(): void {
    if (this.filterPanel) {
      this.filterPanel = false;
    } else {
      this.filterPanel = true;
    }
  }
}
