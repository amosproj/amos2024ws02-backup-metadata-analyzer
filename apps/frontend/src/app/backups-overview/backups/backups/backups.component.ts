import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
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
  private readonly timeRangeSubject$ = new BehaviorSubject<TimeRangeConfig>({
    fromDate: new Date(),
    toDate: new Date(),
    range: 'month',
  });

  timeRanges: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];
  readonly timeRange$ = this.timeRangeSubject$.pipe(
    map((config) => config.range)
  );

  loading: boolean = false;
  pageSize = 10;
  backupSizeFilter: CustomFilter;
  backupDateFilter: CustomFilter;

  readonly backups$: Observable<APIResponse<Backup>>;
  readonly chartBackups$: Observable<APIResponse<Backup>>;

  private filterOptions$ = new BehaviorSubject<BackupFilterParams>(
    INITIAL_FILTER
  );
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly backupService: BackupService,
    private readonly chartService: ChartService
  ) {
    this.backupSizeFilter = new CustomFilter('size');
    this.backupDateFilter = new CustomFilter('date');

    this.backups$ = this.filterOptions$.pipe(
      switchMap((params) => this.backupService.getAllBackups(params)),
      takeUntil(this.destroy$)
    );

    this.chartBackups$ = this.timeRangeSubject$.pipe(
      distinctUntilChanged(
        (prev, curr) =>
          prev.range === curr.range &&
          prev.fromDate.getTime() === curr.fromDate.getTime() &&
          prev.toDate.getTime() === curr.toDate.getTime()
      ),
      map(({ fromDate, toDate }) => ({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      })),
      switchMap((dateRange) => this.backupService.getAllBackups(dateRange)),
      tap((response) => {
        if (response.data && response.data.length > 0) {
          // Prepare and update column chart
          const columnData = this.chartService.prepareColumnData(
            response.data,
            this.timeRangeSubject$.getValue().range
          );
          this.chartService.updateChart('backupTimelineChart', columnData);

          // Prepare and update pie chart
          const pieData = this.chartService.preparePieData(response.data);
          this.chartService.updateChart('backupSizeChart', pieData);
        } else {
          // Handle the case where there's no data
          console.warn('No data received for chart updates.');
        }
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    combineLatest([
      this.backupDateFilter.changes.pipe(startWith(null)),
      this.backupSizeFilter.changes.pipe(startWith(null)),
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
