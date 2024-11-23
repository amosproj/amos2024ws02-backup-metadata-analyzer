import { Injectable } from '@angular/core';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ITimeInterval } from '@amcharts/amcharts5/.internal/core/util/Time';
import { Backup } from '../../../shared/types/backup';
import { Observable, Subject, takeUntil } from 'rxjs';

type ChartType = 'timeline' | 'pie' | 'column';
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
    const root = this.initializeRoot(config.id);
    const chart = this.initializeChart(root, config);
    const series = this.createSeries(chart, config, root, timeRange);

    this.addChartControls(chart, config);
    this.subscribeToData(series, data$, config, timeRange);

    this.charts[config.id] = chart;
    this.series[config.id] = series;

    this.animateChart(chart, series);
  }

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
      paddingLeft: 20,
      paddingTop: 10,
      paddingBottom: 0,
    };

    switch (config.type) {
      case 'column':
        return root.container.children.push(
          am5xy.XYChart.new(root, {
            ...commonConfig,
            panX: false,
            panY: false,
            wheelX: 'none',
            wheelY: 'none',
          })
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
    timeRange: TimeRange
  ) {
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: 'none',
        }),
        numberFormat: '#.# MB',
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: this.getBaseInterval(timeRange),
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
          pan: 'none',
          //tooltipLocation: 0.5,
        }),
        tooltipDateFormat: this.getDateFormat(timeRange),
      })
    );

    return { xAxis, yAxis };
  }

  private createSeries(
    chart: am5.Chart,
    config: ChartConfig,
    root: am5.Root,
    timeRange?: TimeRange
  ): am5.Series {
    if (chart instanceof am5xy.XYChart && timeRange) {
      const { xAxis, yAxis } = this.createAxes(chart, root, timeRange);
      
      return chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: config.seriesName || 'Backups',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: config.valueYField || 'sizeMB',
          valueXField: config.valueXField || 'creationDate',
          clustered: true,
          tooltip: am5.Tooltip.new(root, {
            labelText: this.getTooltipText(timeRange),
          }),
        })
      );
    } else if (chart instanceof am5percent.PieChart) {
      return chart.series.push(
        am5percent.PieSeries.new(root, {
          name: config.seriesName || 'Distribution',
          valueField: config.valueField || 'value',
          categoryField: config.categoryField || 'category',
          legendValueText: '{value} backups',
          legendLabelText: '{category}',
        })
      );
    }
    throw new Error('Unsupported chart configuration');
  }

  private addChartControls(chart: am5.Chart, config: ChartConfig): void {
    chart.children.unshift(
      am5.Legend.new(chart.root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15,
      })
    );

    if (chart instanceof am5xy.XYChart) {
      chart.set(
        'cursor',
        am5xy.XYCursor.new(chart.root, {
          behavior: 'none',
          xAxis: chart.xAxes.getIndex(0),
          yAxis: chart.yAxes.getIndex(0),
        })
      );
    }
  }

  private animateChart(chart: am5.Chart, series: am5.Series): void {
    series.appear(1000);
    chart.appear(1000, 100);
  }

  private prepareColumnData(backups: Backup[], timeRange: TimeRange): any[] {
    const groupedData = new Map<string, number>();
    const dateFormat = this.getGroupingFormat(timeRange);

    backups.forEach((backup) => {
      const date = new Date(backup.creationDate);
      const key = this.formatDate(date, dateFormat);
      groupedData.set(key, (groupedData.get(key) || 0) + backup.sizeMB);
    });

    return Array.from(groupedData.entries()).map(([key, total]) => ({
      date: new Date(key).getTime(),
      sizeMB: total,
    }));
  }

  private preparePieData(backups: Backup[]): any[] {
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

  private getDateFormat(timeRange: TimeRange): string {
    switch (timeRange) {
      case 'week':
      case 'month':
        return 'MMM dd';
      case 'year':
        return "MMM 'W'w";
      default:
        return 'MMM dd';
    }
  }

  private getGroupingFormat(timeRange: TimeRange): string {
    switch (timeRange) {
      case 'week':
      case 'month':
        return 'yyyy-MM-dd';
      case 'year':
        return 'yyyy-[W]ww';
      default:
        return 'yyyy-MM-dd';
    }
  }

  private formatDate(date: Date, format: string): string {
    // Simple date formatting - you might want to use a library like date-fns
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const week = this.getWeekNumber(date);

    return format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day)
      .replace('[W]ww', `W${String(week).padStart(2, '0')}`);
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private getTooltipText(timeRange: TimeRange): string {
    switch (timeRange) {
      case 'week':
      case 'month':
        return "Date: {valueX.formatDate('MMM dd')}\nSize: {valueY} MB";
      case 'year':
        return "Week: {valueX.formatDate('MMM W')}\nTotal Size: {valueY} MB";
      default:
        return 'Size: {valueY} MB';
    }
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
    //console.log('Subscribing to data updates', config.type);
    data$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (backups) => {
        //console.log('xxx');
        if (backups?.length > 0) {
          //console.log(backups);
          //console.log('type', config.type);
          const chartData =
            config.type === 'column'
              ? this.prepareColumnData(backups, timeRange!)
              : this.preparePieData(backups);

          series.data.setAll(chartData);
          //console.log(series.data);

          if (config.type === 'column') {
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
    const chart = this.charts[chartId];
    const series = this.series[chartId];

    if (
      chart instanceof am5xy.XYChart &&
      series instanceof am5xy.ColumnSeries
    ) {
      const xAxis = chart.xAxes.getIndex(0);
      if (xAxis instanceof am5xy.DateAxis) {
        xAxis.set('baseInterval', this.getBaseInterval(timeRange));
        xAxis.set('tooltipDateFormat', this.getDateFormat(timeRange));
      }

      series.get('tooltip')?.set('labelText', this.getTooltipText(timeRange));
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
