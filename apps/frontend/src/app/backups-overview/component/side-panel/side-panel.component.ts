import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
import { BackupService } from '../../service/backup-service/backup-service.service';
import { ChartService } from '../../service/chart-service/chart-service.service';
import { Backup } from '../../../shared/types/backup';
import { APIResponse } from '../../../shared/types/api-response';
import { ChartInformation } from '../../../shared/types/chartInformation';
import { ChartType } from '../../../shared/enums/chartType';
import { BackupTask } from '../../../shared/types/backup.task';
import { BackupType } from '../../../shared/enums/backup.types';

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

  filterCount$: Observable<number> = of(0);

  // Filters for Charts
  // Backup types for the filter
  backupEnumTypes = Object.keys(BackupType).filter((item) => {
    return isNaN(Number(item));
  });

  selectedBackupTypes: string[] = [];
  protected selectedTask: BackupTask[] = [];

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

  private readonly destroy$ = new Subject<void>();

  //Observables
  readonly chartBackups$: Observable<APIResponse<Backup>>;
  allBackupTasks$: Observable<BackupTask[]>;
  protected selectedbackupTasks$: Observable<BackupTask[]>;

  constructor(
    private readonly backupService: BackupService,
    private readonly chartService: ChartService
  ) {
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
        params: {
          fromDate: timeRange.fromDate.toISOString(),
          toDate: timeRange.toDate.toISOString(),
          types: backupTypes,
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
    this.setTimeRange('month');
    this.filterCount$ = combineLatest([
      this.backupTaskSubject$,
      this.backupTypesSubject$,
    ]).pipe(map(([tasks, types]) => tasks.length + types.length));
  }

  /**
   * Initialize the charts
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      // Create charts
      for (const chart of this.charts) {
        switch (chart.type) {
          case ChartType.SIZEPIECHART:
            this.chartService.createChart(
              {
                id: chart.id,
                type: 'pie',
                valueField: 'value',
                categoryField: 'category',
                seriesName: 'SizeDistribution',
              },
              this.chartBackups$.pipe(
                map((response: APIResponse<Backup>) => response.data)
              )
            );
            break;
          case ChartType.SIZECOLUMNCHART:
            this.chartService.createChart(
              {
                id: chart.id,
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
            break;
          default:
            console.error('Unknown chart type:', chart.type);
            break;
        }
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chartService.dispose();
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
}
