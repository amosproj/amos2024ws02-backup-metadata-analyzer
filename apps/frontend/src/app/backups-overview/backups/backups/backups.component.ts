import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { BackupService } from '../../service/backup-service.service';
import { Backup } from '../../../shared/types/backup';
import { ClrDatagridStateInterface } from '@clr/angular';
import { HttpParams } from '@angular/common/http';
import { ITimeInterval } from '@amcharts/amcharts5/.internal/core/util/Time';

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit, OnDestroy {
  protected root!: am5.Root;
  selectedBackups: Backup[] = [];
  selectedTimeRange: 'week' | 'month' | 'year' = 'month';

  readonly backupSubject$ = new BehaviorSubject<Backup[]>([]);
  readonly backups$: Observable<Backup[]>;
  private filterOptions$ = new BehaviorSubject<any>({});

  constructor(private readonly backupService: BackupService) {
    this.filterOptions$
      .pipe(
        switchMap((filterOptions) =>
          this.backupService.getAllBackups(filterOptions)
        )
      )
      .subscribe((data) => {
        this.backupSubject$.next(data);
      });

    this.backups$ = this.backupSubject$.asObservable();
    this.setTimeRange('month');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createBackupTimelineChart();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  setTimeRange(range: 'week' | 'month' | 'year'): void {
    this.selectedTimeRange = range;

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
    const params = new HttpParams()
      .set('fromDate', fromDate.toISOString())
      .set('toDate', toDate.toISOString())
      .set('orderBy', 'creationDate');

    this.filterOptions$.next(params);
  }

  private createBackupTimelineChart() {
    let chartData$ = this.backups$.pipe(
      map((data) => {
        const sortedData = data.sort(
          (a, b) =>
            new Date(a.creationDate).getTime() -
            new Date(b.creationDate).getTime()
        );
        const aggregatedData = this.aggregateDataByTimeRange(sortedData);

        return aggregatedData.map((item) => ({
          id: item.id,
          sizeMB: item.sizeMB,
          creationDate: new Date(item.creationDate).getTime(),
          count: item.count || 1,
        }));
      })
    );
    // Chart-Root erstellen
    this.root = am5.Root.new('backupTimelineChart');

    this.root.setThemes([am5themes_Animated.new(this.root)]);
    this.root.fps = 30;

    // Chart erstellen
    let chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        layout: this.root.verticalLayout,
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        paddingLeft: 0,
      })
    );

    const tooltip = am5.Tooltip.new(this.root, {
      labelText: 'Size: {valueY} MB\nDate: {valueX}\nBackups: {count}',
      getFillFromSprite: true,
      getStrokeFromSprite: true,
      autoTextColor: true,
    });

    // X-Achse
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: this.getBaseInterval(),
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 80,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
        }),
        tooltip: am5.Tooltip.new(this.root, {}),
        groupData: true,
        groupCount: 500, // Maximale Anzahl der angezeigten Datenpunkte
        extraMax: 0.1,
      })
    );

    // Y-Achse
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {
          minGridDistance: 50,
        }),
        numberFormat: '#.# MB',
      })
    );

    // Serie
    let series = chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: 'Backup Size',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'sizeMB',
        valueXField: 'creationDate',
        tooltip,
      })
    );

    // Bullets
    series.bullets.push((root) => {
      const circle = am5.Circle.new(root, {
        radius: 4,
        fill: series.get('fill'),
        stroke: root.interfaceColors.get('background'),
        strokeWidth: 2,
        opacity: 0.7,
      });
      return am5.Bullet.new(root, {
        sprite: circle,
      });
    });

    // Cursor
    chart.set(
      'cursor',
      am5xy.XYCursor.new(this.root, {
        behavior: 'zoomXY',
        snapToSeries: [series],
      })
    );

    // Scrollbar
    let scrollbarX = chart.set(
      'scrollbarX',
      am5.Scrollbar.new(this.root, {
        orientation: 'horizontal',
        minHeight: 10,
      })
    );

    // Daten laden und zoomen
    chartData$.subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          series.data.setAll(data);
        }
      },
      error: (error) => console.error('Error loading chart data:', error),
    });

    // Animation
    series.appear(1000);
    chart.appear(1000, 100);
  }

  // Datenaggregation
  private aggregateDataByTimeRange(data: Backup[]): any[] {
    const interval = this.getAggregationInterval();
    const aggregated = new Map();

    data.forEach((backup) => {
      const date = new Date(backup.creationDate);
      const timeKey = this.roundDateToInterval(date, interval);

      if (!aggregated.has(timeKey)) {
        aggregated.set(timeKey, {
          creationDate: timeKey,
          sizeMB: backup.sizeMB,
          count: 1,
          id: backup.id,
        });
      } else {
        const existing = aggregated.get(timeKey);
        existing.sizeMB = Math.max(existing.sizeMB, backup.sizeMB);
        existing.count += 1;
      }
    });
    return Array.from(aggregated.values());
  }

  //  Zeitintervall-Bestimmung
  private getAggregationInterval(): { unit: string; value: number } {
    switch (this.selectedTimeRange) {
      case 'week':
        return { unit: 'hour', value: 4 }; // 4-Stunden-Intervalle
      case 'month':
        return { unit: 'day', value: 1 }; // Tagesintervalle
      case 'year':
        return { unit: 'week', value: 1 }; // Wochenintervalle
      default:
        return { unit: 'day', value: 1 };
    }
  }

  private getBaseInterval(): ITimeInterval {
    switch (this.selectedTimeRange) {
      case 'week':
        return { timeUnit: 'hour', count: 4 };
      case 'month':
        return { timeUnit: 'day', count: 1 };
      case 'year':
        return { timeUnit: 'week', count: 1 };
      default:
        return { timeUnit: 'day', count: 1 };
    }
  }
// Datum auf das gewünschte Zeitintervall runden
  private roundDateToInterval(
    date: Date,
    interval: { unit: string; value: number }
  ): number {
    const d = new Date(date);
    switch (interval.unit) {
      case 'hour':
        d.setMinutes(0, 0, 0);
        d.setHours(Math.floor(d.getHours() / interval.value) * interval.value);
        break;
      case 'day':
        d.setHours(0, 0, 0, 0);
        break;
      case 'week':
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        break;
    }
    return d.getTime();
  }

  refresh(option?: ClrDatagridStateInterface<Backup>): void {
    let params: HttpParams = new HttpParams();

    if (option) {
      if (option.page) {
        if (option.page.current && option.page.size)
          params = params.append(
            'offset',
            (option.page.current - 1) * option.page.size
          );
        if (option.page.size) params = params.append('limit', option.page.size);
      }

      if (option.sort) {
        params = params.set('orderBy', option.sort.by as string);
        params = params.set('sortOrder', option.sort.reverse ? 'DESC' : 'ASC');
      }
      if (option.filters) {
        option.filters.forEach((filter) => {
          params = params.append(filter.property, filter.value);
        });
      }
    }
    this.filterOptions$.next(params);
  }
}
