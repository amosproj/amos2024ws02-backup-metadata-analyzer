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

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit, OnDestroy {
  protected root!: am5.Root;
  selectedBackups: Backup[] = [];
  selectedTimeRange: 'week' | 'month' | 'year' = 'month'; // Default: last month

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

    // Initial load with default time range
    this.setTimeRange('month');
  }

  ngAfterViewInit(): void {
    // Kleine Verzögerung für die Chart-Initialisierung
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
    // Format dates as ISO strings or whatever format your backend expects
    const params = new HttpParams()
      .set('fromDate', fromDate.toISOString())
      .set('toDate', toDate.toISOString());
    console.log(fromDate, toDate);

    this.filterOptions$.next(params);
  }

  getTimeRange(): string {
    return this.selectedTimeRange
  }

  private createBackupTimelineChart() {
    let chartData$ = this.backups$.pipe(
      map((data) =>
        data.map((item) => ({
          id: item.id,
          sizeMB: item.sizeMB,
          creationDate: new Date(item.creationDate).getTime(), // Convert to timestamp
        }))
      )
    );

    // Chart-Root erstellen
    this.root = am5.Root.new('backupTimelineChart');

    // Theme hinzufügen
    this.root.setThemes([am5themes_Animated.new(this.root)]);

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

    chart.children.unshift(
      am5.Label.new(this.root, {
        text: 'Backup Timeline',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    // X-Achse
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'day', count: 1 },
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 50,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
        }),
        tooltip: am5.Tooltip.new(this.root, {}),
        dateFormats: {
          day: 'MMM dd',
          month: 'MMM yyyy',
        },
        periodChangeDateFormats: {
          day: 'MMM dd',
          month: 'MMM yyyy',
        },
      })
    );

    // Y-Achse
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
        numberFormat: '#.# MB',
      })
    );

    // LineSeries hinzufügen
    let series = chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: 'Backup Size',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'sizeMB',
        valueXField: 'creationDate',
        tooltip: am5.Tooltip.new(this.root, {
          labelText: 'Size: {valueY} MB\nDate: {valueX}',
        }),
      })
    );

    // Add bullet points - Fixed type definition
    series.bullets.push((root: am5.Root) => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: series.get('fill'),
          stroke: root.interfaceColors.get('background'),
          strokeWidth: 2,
        }),
      });
    });

    // Add cursor
    chart.set(
      'cursor',
      am5xy.XYCursor.new(this.root, {
        behavior: 'zoomX',
      })
    );

    // Nach der Cursor-Definition
    let scrollbarX = chart.set(
      'scrollbarX',
      am5.Scrollbar.new(this.root, {
        orientation: 'horizontal',
      })
    );

    let rangeDate = xAxis.makeDataItem({});
    let rangeTime = Date.now();
    rangeDate.set('value', rangeTime);
    rangeDate.set('endValue', rangeTime - 1000 * 60 * 60 * 24 * 30); // 30 Tage

    xAxis.createAxisRange(rangeDate);

    chartData$.subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          series.data.setAll(data);

          // Set zoom to match selected time range
          const endDate = new Date();
          const startDate = new Date();

          switch (this.selectedTimeRange) {
            case 'week':
              startDate.setDate(startDate.getDate() - 7);
              break;
            case 'month':
              startDate.setMonth(startDate.getMonth() - 1);
              break;
            case 'year':
              startDate.setFullYear(startDate.getFullYear() - 1);
              break;
          }

          xAxis.zoomToDates(startDate, endDate);
        } else {
          console.warn('No data available for chart');
        }
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
      },
    });

    // Make stuff animate on load
    series.appear(1000);
    chart.appear(1000, 100);
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
