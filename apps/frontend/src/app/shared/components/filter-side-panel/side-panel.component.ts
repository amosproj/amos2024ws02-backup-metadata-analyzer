import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BackupType } from '../../enums/backup.types';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ChartType } from '../../enums/chartType';
import { BackupTask } from '../../types/backup.task';
import { ChartInformation } from '../../types/chartInformation';
import { APIResponse } from '../../types/api-response';
import { Backup } from '../../types/backup';
import { BackupService } from '../../services/backup-service/backup-service.service';
import { ChartService } from '../../services/chart-service/chart-service.service';
import { TimelineDataPoint, PieChartDataPoint } from '../../types/chart-config';
import { BackupFilterParams } from '../../types/backup-filter-type';

interface TimeRangeConfig {
  fromDate: Date;
  toDate: Date;
  range: 'week' | 'month' | 'year';
}

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent implements OnInit, AfterViewInit, OnDestroy {
  // Determine if the filter panel is open or closed
  @Input() isOpen = false;
  // Charts to create
  @Input() charts: ChartInformation[] = [];

  // Time ranges for the charts
  protected timeRanges: ('week' | 'month' | 'year')[] = [
    'week',
    'month',
    'year',
  ];

  loading = false;
  selectedBackupTypes: string[] = [];
  selectedTask: BackupTask[] = [];

  // Backup types for the filter
  backupEnumTypes = Object.keys(BackupType).filter((item) => {
    return isNaN(Number(item));
  });
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
  private readonly destroy$ = new Subject<void>();

  //Observables
  filterCount$: Observable<number> = of(0);
  timelineData$!: Observable<TimelineDataPoint[]>;
  backupSizePieChartData$!: Observable<PieChartDataPoint[]>;
  backupAlertPieChartData$!: Observable<PieChartDataPoint[]>;
  private readonly filterParams$: Observable<BackupFilterParams>;

  chartBackups$: Observable<APIResponse<Backup>> = of({
    data: [],
    total: 0,
    paginationData: { limit: 0, offset: 0, total: 0 },
  });
  allBackupTasks$: Observable<BackupTask[]> = of([]);
  protected selectedbackupTasks$: Observable<BackupTask[]> = of([]);

  constructor(
    private readonly backupService: BackupService,
    private readonly chartService: ChartService
  ) {
    // Filter params for the chart
    this.filterParams$ = combineLatest([
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
      this.backupTypesSubject$.pipe(
        distinctUntilChanged((prev, curr) => {
          if (!prev && !curr) return true;
          if (!prev || !curr) return false;
          if (prev.length !== curr.length) {
            return false;
          }
          const prevIds = prev.map((p) => p).sort();
          const currIds = curr.map((c) => c).sort();
          return prevIds === currIds;
        })
      ),
    ]).pipe(
      map(([timeRange, tasks, backupTypes]) => ({
        fromDate: timeRange.fromDate.toISOString(),
        toDate: timeRange.toDate.toISOString(),
        types: backupTypes || [],
        taskIds: (tasks || []).map((task) => task?.id).filter(Boolean) || [],
      })),
      shareReplay(1)
    );
  }

  /**
   * Initialize the component and all needed data
   */
  ngOnInit(): void {
    this.loadData();
    this.backupService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
    this.setTimeRange('month');

    this.filterCount$ = combineLatest([
      this.backupTaskSubject$,
      this.backupTypesSubject$,
    ]).pipe(map(([tasks, types]) => tasks.length + types.length));
  }

  /**
   * Load all backups and filter them based on the filter options for charts
   */
  loadData(): void {
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

    this.timelineData$ = this.filterParams$.pipe(
      switchMap((params) => {
        return this.backupService.getBackupSizesPerDay(params);
      }),
      tap({
        next: (response) => {
          if (response.length) {
            this.chartService.updateChart('backupTimelineChart', response);
          }
        },
        error: (error) => {
          console.error('Error updating timeline chart:', error);
          this.loading = false;
        },
      }),
      shareReplay(1)
    );

    this.backupSizePieChartData$ = this.filterParams$.pipe(
      switchMap((params) => {
        return this.backupService.getGroupedBackupSizes(params);
      }),
      tap({
        next: (response) => {
          if (response.length) {
            this.chartService.updateChart('backupSizeChart', response);
          }
        },
        error: (error) => {
          console.error('Error updating timeline chart:', error);
          this.loading = false;
        },
      }),
      shareReplay(1)
    );

    /*     this.backupAlertPieChartData$ = this.backupService
      .getBackupAlertSeverityOverview()
      .pipe(
        tap({
          next: (response) => {
            if (response.length) {
              this.chartService.updateChart('overviewAlertsPieChart', response);
            }
          },
          error: (error) => {
            console.error('Error updating timeline chart:', error);
            this.loading = false;
          },
        }),
        shareReplay(1)
      ); */
    this.backupAlertPieChartData$ = of([
      { category: 'ok', count: 58197 },
      { category: 'info', count: 0 },
      { category: 'warning', count: 393 },
      { category: 'critical', count: 2 },
    ]);
  }
  /**
   * Initialize the charts
   */
  ngAfterViewInit(): void {
    this.createCharts();
    this.backupService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.createCharts();
      });
  }

  /**
   * Create the charts
   * each chart is initialized with the data from the API
   */
  createCharts(): void {
    setTimeout(() => {
      for (const chart of this.charts) {
        switch (chart.type) {
          case ChartType.SIZEPIECHART:
            if (chart.id === 'backupStatisticsPageSizePieChart') {
              this.chartService.createChart(
                {
                  id: chart.id,
                  type: 'pie',
                  valueField: 'count',
                  categoryField: 'category',
                  seriesName: 'SizeDistribution',
                  hideLabels: true,
                  tooltipText:
                    '{category}: [bold]{value.percent.formatNumber("#.##")}%[/]\n({value} backups)',
                },
                this.backupSizePieChartData$
              );
            }
            if (chart.id === 'overviewAlertsPieChart') {
              this.chartService.createChart(
                {
                  id: chart.id,
                  type: 'pie',
                  valueField: 'count',
                  categoryField: 'category',
                  seriesName: 'SizeDistribution',
                  hideLabels: true,
                  tooltipText: '{category}: [bold]{value}[/] alerts',
                },
                this.backupAlertPieChartData$
              );
            }

            break;
          case ChartType.SIZECOLUMNCHART:
            this.chartService.createChart(
              {
                id: chart.id,
                type: 'column',
                valueYField: 'value',
                valueXField: 'date',
                seriesName: 'BackupSize',
                tooltipText: '[bold]{valueY}[/] MB\n{valueX}',
              },
              this.timelineData$,
              this.timeRangeSubject$.getValue().range
            );
            break;
        }
      }
    }, 100);
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

    // Update all charts with the new time range
    for (const chart of this.charts) {
      //So far only relevant for the column chart
      if (chart.type === ChartType.SIZECOLUMNCHART) {
        this.chartService.updateTimeRange(chart.id, range);
      }
    }
  }

  /**
   * Set selected Backup task to filter the charts
   * @param tasks selected Backup task
   */
  setBackupTask(tasks: BackupTask[]): void {
    this.selectedTask = tasks;
    this.backupTaskSubject$.next(tasks);
  }
  /**
   * Set selected Backup types to filter the charts
   * @param types selected Backup types
   */
  setBackupTypes(types: BackupType[]): void {
    this.selectedBackupTypes = types;
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
   * Change the state of the filter panel to open or close it
   */
  protected changeFilterPanelState(): void {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chartService.dispose();
  }
}
