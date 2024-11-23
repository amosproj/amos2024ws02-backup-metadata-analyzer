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
import { ClrDatagridStateInterface } from '@clr/angular';
import { CustomFilter } from './backupfilter';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';
import { ChartService } from '../../service/chart-service/chart-service.service';

const INITIAL_FILTER: BackupFilterParams = {
  limit: 10,
};

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit, OnDestroy, OnInit {
  private readonly timeRangeSubject$ = new BehaviorSubject<
    'week' | 'month' | 'year'
  >('month');
  timeRanges: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];
  readonly timeRange$ = this.timeRangeSubject$.asObservable();
  selectedTimeRange: 'week' | 'month' | 'year' = 'month';

  loading: boolean = false;
  readonly pageSize = 10;
  backupSizeFilter: CustomFilter;
  backupDateFilter: CustomFilter;

  readonly backups$: Observable<Backup[]>;
  readonly chartBackups$: Observable<Backup[]>;
  readonly totalItems$: Observable<number>;

  private filterOptions$ = new BehaviorSubject<BackupFilterParams>(
    INITIAL_FILTER
  );
  private chartFilterOptions$ = new BehaviorSubject<BackupFilterParams>({});
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

    this.chartBackups$ = this.chartFilterOptions$.pipe(
      switchMap((params) => this.backupService.getAllBackups(params)),
      takeUntil(this.destroy$)
    );

    this.totalItems$ = this.backupService.getTotalBackupsCount();
  }

  ngOnInit(): void {
    // Initialize filters with default values
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
        this.backups$ // should use chartBackups$
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
        this.backups$, // should use chartBackups$
        this.selectedTimeRange
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
    console.log(range);
    this.selectedTimeRange = range;

    this.timeRangeSubject$.next(range);

    const toDate = new Date();
    const fromDate = new Date();

    const dateRanges = {
      week: () => fromDate.setDate(fromDate.getDate() - 7),
      month: () => fromDate.setMonth(fromDate.getMonth() - 1),
      year: () => fromDate.setFullYear(fromDate.getFullYear() - 1),
    };

    dateRanges[range]();

    this.chartFilterOptions$.next({
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });

    this.chartService.updateTimeRange('backupTimelineChart', range);
  }

  refresh(state: ClrDatagridStateInterface<any>): void {
    this.loading = true;

    const params: BackupFilterParams = {
      ...INITIAL_FILTER,
      limit: state.page?.size || this.pageSize,
      offset: state.page?.current
        ? (state.page.current - 1) * (state.page?.size || this.pageSize)
        : 0,
      sortOrder: state.sort?.reverse ? 'DESC' : 'ASC',
    };

    if (state.filters) {
      Object.assign(params, this.buildFilterParams());
    }

    this.filterOptions$.next(params);
    this.loading = false;
  }
}
