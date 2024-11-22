import { Injectable } from '@angular/core';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ITimeInterval } from '@amcharts/amcharts5/.internal/core/util/Time';
import { Backup } from '../../../shared/types/backup';
import { Observable, Subject, takeUntil } from 'rxjs';

type ChartType = 'timeline' | 'pie';
type TimeRange = 'week' | 'month' | 'year';

interface ChartConfig {
  id: string;
  type: ChartType;
  height?: number;
  tooltipText?: string;
  valueYField?: string;
  valueXField?: string;
  categoryField?: string;
  valueField?: string;
  seriesName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private roots: { [key: string]: am5.Root } = {};
  private charts: { [key: string]: am5.Chart } = {};
  private series: { [key: string]: am5.Series } = {};
  private readonly destroy$ = new Subject<void>();

  constructor() {}

  createChart(
    config: ChartConfig,
    data$: Observable<Backup[]>,
    timeRange?: TimeRange
  ): void {
    // Initialize root
    const root = this.initializeRoot(config.id);

    // Create chart based on type
    const chart = this.initializeChart(root, config);

    // Add common elements
    this.addChartControls(chart, config);

    // Create series based on chart type
    const series = this.createSeries(chart, config, root);

    // Add data subscription
    this.subscribeToData(series, data$, config, timeRange);

    // Store references
    this.charts[config.id] = chart;
    this.series[config.id] = series;

    if (config.type === 'timeline' && timeRange) {
      this.updateTimeRange(config.id, timeRange);
    }

    // Animate
    this.animateChart(chart, series);

    console.log('Chart created:', config.id);
  }

  /**
   * Initializes chart root
   */
  private initializeRoot(containerId: string): am5.Root {
    if (this.roots[containerId]) {
      this.roots[containerId].dispose();
    }

    const root = am5.Root.new(containerId);
    root.setThemes([am5themes_Animated.new(root)]);
    this.roots[containerId] = root;
    return root;
  }

  /**
   * Initializes chart based on type
   */
  private initializeChart(root: am5.Root, config: ChartConfig): am5.Chart {
    const commonConfig = {
      layout: root.verticalLayout,
      paddingRight: 20,
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
    };

    switch (config.type) {
      case 'timeline':
        return root.container.children.push(
          am5xy.XYChart.new(root, commonConfig)
        );
      case 'pie':
        return root.container.children.push(
          am5percent.PieChart.new(root, {
            ...commonConfig,
            innerRadius: am5.percent(50),
            radius: am5.percent(80),
          })
        );
      default:
        throw new Error(`Unsupported chart type: ${config.type}`);
    }
  }

  /**
   * Creates axes for XY charts
   */
  private createAxes(
    chart: am5xy.XYChart,
    root: am5.Root,
    timeRange?: TimeRange
  ) {
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 1,
        renderer: am5xy.AxisRendererY.new(root, {
          pan: 'zoom',
        }),
        numberFormat: '#.# MB',
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 1,
        baseInterval: this.getBaseInterval(timeRange || 'month'),
        renderer: am5xy.AxisRendererX.new(root, {
          pan: 'zoom',
          minGridDistance: 50,
        }),
      })
    );

    return { xAxis, yAxis };
  }

  /**
   * Creates series based on chart type
   */
  private createSeries(
    chart: am5.Chart,
    config: ChartConfig,
    root: am5.Root
  ): am5.Series {
    if (chart instanceof am5xy.XYChart) {
      const { xAxis, yAxis } = this.createAxes(chart, root, 'month');
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: config.seriesName || 'Series',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: config.valueYField || 'value',
          valueXField: config.valueXField || 'date',
          tooltip: am5.Tooltip.new(root, {
            labelText: config.tooltipText || '{valueY}',
            getFillFromSprite: true,
          }),
        })
      );

      this.addBullets(series, root);
      return series;
    } else if (chart instanceof am5percent.PieChart) {
      return chart.series.push(
        am5percent.PieSeries.new(root, {
          name: config.seriesName || 'Series',
          valueField: config.valueField || 'value',
          categoryField: config.categoryField || 'category',
          legendValueText: '{value} backups',
          legendLabelText: '{category}',
        })
      );
    }
    throw new Error('Unsupported chart type');
  }

  /**
   * Adds chart controls (legend, cursor, scrollbars)
   */
  private addChartControls(chart: am5.Chart, config: ChartConfig): void {
    // legend
    const legend = chart.children.push(
      am5.Legend.new(chart.root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15,
      })
    );

    if (chart instanceof am5xy.XYChart) {
      //  cursor
      chart.set(
        'cursor',
        am5xy.XYCursor.new(chart.root, {
          behavior: 'none',
          xAxis: chart.xAxes.getIndex(0),
          yAxis: chart.yAxes.getIndex(0),
        })
      );

      //  scrollbars
      chart.set(
        'scrollbarX',
        am5.Scrollbar.new(chart.root, {
          orientation: 'horizontal',
        })
      );

      chart.set(
        'scrollbarY',
        am5.Scrollbar.new(chart.root, {
          orientation: 'vertical',
        })
      );
    }
  }

  /**
   * Adds bullets
   */
  private addBullets(series: am5xy.LineSeries, root: am5.Root): void {
    series.bullets.push((sprite, target) => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: series.get('fill'),
          stroke: root.interfaceColors.get('background'),
          strokeWidth: 2,
        }),
      });
    });
  }

  private animateChart(chart: am5.Chart, series: am5.Series): void {
    series.appear(1000);
    chart.appear(1000, 100);
  }

  /**
   * Prepares data for timeline chart
   */
  private prepareTimelineData(backups: Backup[]): any[] {
    console.log('Preparing timeline data');
    return backups
      .sort(
        (a, b) =>
          new Date(a.creationDate).getTime() -
          new Date(b.creationDate).getTime()
      )
      .map((backup) => ({
        date: new Date(backup.creationDate).getTime(),
        sizeMB: backup.sizeMB,
        count: 1,
      }));
  }

  /**
   * Prepares data for pie chart
   */
  private prepareSizeDistributionData(backups: Backup[]): any[] {
    const ranges = [
      { min: 0, max: 100, category: '0-100 MB' },
      { min: 100, max: 500, category: '100-500 MB' },
      { min: 500, max: 1000, category: '500MB-1GB' },
      { min: 1000, max: Infinity, category: '>1GB' },
    ];

    return ranges
      .map((range) => ({
        category: range.category,
        value: backups.filter(
          (b) => b.sizeMB >= range.min && b.sizeMB < range.max
        ).length,
      }))
      .filter((item) => item.value > 0);
  }

  /**
   * Subscribes to data updates
   */
  private subscribeToData(
    series: am5.Series,
    data$: Observable<Backup[]>,
    config: ChartConfig,
    timeRange?: TimeRange
  ): void {
    console.log('Subscribing to data updates', config.type);
    data$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (backups) => {
        console.log('xxx');
        if (backups?.length > 0) {
          console.log(backups);
          console.log('type', config.type);
          const chartData =
            config.type === 'timeline'
              ? this.prepareTimelineData(backups)
              : this.prepareSizeDistributionData(backups);

          series.data.setAll(chartData);
          console.log(series.data);

          if (config.type === 'timeline') {
            const xAxis = (series as am5xy.LineSeries).get('xAxis');
            if (xAxis instanceof am5xy.DateAxis) {
              xAxis.zoomToDates(
                new Date(backups[0].creationDate),
                new Date(backups[backups.length - 1].creationDate)
              );
            }
          }
        }
      },
      error: (error) =>
        console.error(`Error updating ${config.type} chart:`, error),
    });
  }
  /**
   * Updates time range for timeline charts
   *
   * this is not working properly
   */
  updateTimeRange(chartId: string, timeRange: TimeRange): void {
    const series = this.series[chartId];
    if (series instanceof am5xy.LineSeries) {
      const xAxis = series.get('xAxis');
      if (xAxis instanceof am5xy.DateAxis) {
        xAxis.set('baseInterval', this.getBaseInterval(timeRange));
      }
    }
  }

  dispose(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.roots).forEach((root) => root.dispose());
    this.roots = {};
    this.charts = {};
    this.series = {};
  }

  private calculateSizeRanges(backups: Backup[]) {
    const ranges = [
      { min: 0, max: 100, label: '0-100 MB' },
      { min: 100, max: 500, label: '100-500 MB' },
      { min: 500, max: 1000, label: '500MB-1GB' },
      { min: 1000, max: Infinity, label: '>1GB' },
    ];

    return ranges.map((range) => ({
      category: range.label,
      value: backups.filter(
        (b) => b.sizeMB >= range.min && b.sizeMB < range.max
      ).length,
    }));
  }

  private getBaseInterval(timeRange: string): ITimeInterval {
    switch (timeRange) {
      case 'week':
        return { timeUnit: 'hour', count: 4 };
      case 'month':
        return { timeUnit: 'day', count: 1 };
      case 'year':
        return { timeUnit: 'week', count: 1 };
      default:
        return { timeUnit: 'month', count: 1 };
    }
  }
}
