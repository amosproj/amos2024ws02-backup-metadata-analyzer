import { Injectable } from '@angular/core';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ITimeInterval } from '@amcharts/amcharts5/.internal/core/util/Time';
import { Observable, Subject, takeUntil } from 'rxjs';
import _ from 'lodash';
import {
  ChartConfig,
  ChartType,
  TimeRange,
  PieChartDataPoint,
  TimelineDataPoint,
} from '../../types/chart-config';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private roots: { [key: string]: am5.Root } = {};
  charts: { [key: string]: am5.Chart } = {};
  series: { [key: string]: am5.Series } = {};
  private modals: { [key: string]: am5.Modal } = {};
  private readonly destroy$ = new Subject<void>();

  constructor() {}

  /**
   * Creates chart based on config
   * @param config contains all neccessary information about the chart
   * @param data$ data to be displayed
   * @param timeRange select the range of time for the chart
   */
  createChart<T>(
    config: ChartConfig,
    data$: Observable<T>,
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
  /**
   * Creates root for the chart
   * @param containerId unique id of the chart
   * @returns root to identify the chart
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
   * @param root defines root of the chart
   * @param config contains all neccessary information about the chart
   * @returns chart instance
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
        this.createModal(root, config.id);
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
        this.createModal(root, config.id);
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
   * @param chart
   * @param root
   * @param timeRange
   * @returns {xAxis, yAxis}
   */
  private createAxes(
    chart: am5xy.XYChart,
    root: am5.Root,
    timeRange: TimeRange
  ): { xAxis: any; yAxis: any } {
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        numberFormat: '#,##0.00 b',
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          pan: 'none',
          minGridDistance: 30,
        }),
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: this.getBaseInterval(timeRange),
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
          pan: 'none',
          visible: true,
        }),
        tooltipDateFormat: this.getDateFormat(timeRange),
        start: 0,
        end: 1,
        visible: true,
        maxDeviation: 0.1,
      })
    );

    // Make axis labels explicitly visible
    xAxis.get('renderer').labels.template.setAll({
      visible: true,
      forceHidden: false,
    });

    // Ensure gridlines are visible
    xAxis.get('renderer').grid.template.setAll({
      visible: true,
      location: 0,
    });

    return { xAxis, yAxis };
  }
  /**
   * Creates series based on chart type and config. Actually creates series for XY charts or pie charts
   * @param chart chart instance
   * @param config configurations for chart
   * @param root 
   * @param timeRange selected time range filter
   * @returns series instance for visualization
   */
  private createSeries(
    chart: am5.Chart,
    config: ChartConfig,
    root: am5.Root,
    timeRange?: TimeRange
  ): am5.Series {
    if (chart instanceof am5xy.XYChart && timeRange) {
      const { xAxis, yAxis } = this.createAxes(chart, root, timeRange);

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: config.seriesName || 'Backups',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: config.valueYField || 'value',
          valueXField: config.valueXField || 'date',
          clustered: true,
          tooltip: am5.Tooltip.new(root, {
            labelText: this.getTooltipFormat(timeRange),
            pointerOrientation: 'horizontal',
          }),
        })
      );

      const columnTemplate = series.columns.template;
      columnTemplate.setAll({
        cornerRadiusTL: 3,
        cornerRadiusTR: 3,
      });

      columnTemplate.states.create('hover', {
        fillOpacity: 1,
      });
      this.chartHasNoDataHandler(series, config, 'column');

      return series;
    } else if (chart instanceof am5percent.PieChart) {
      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          name: config.seriesName || 'Distribution',
          valueField: config.valueField || 'value',
          categoryField: config.categoryField || 'category',
          legendValueText: '{config.valueField} backups',
          legendLabelText: '{category}',
          fillField: 'fill'
        })
      );

      this.chartHasNoDataHandler(series, config, 'pie');

      return series;
    }
    throw new Error('Unsupported chart configuration');
  }
  /**
   * If Chart is XY chart, this function will create modal window with information about data
   * @param chart 
   * @param config 
   */
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
  /**
   * Prepares data for column charts to visualize correct data format
   * @param backups
   * @param timeRange selected filter time range
   * @returns Array of grouped objects with date and sizeMB properties
   */
  prepareColumnData<T>(
    backups: T[],
    timeRange: TimeRange
  ): TimelineDataPoint[] {
    if (!backups?.length) return [];

    const processedData = backups.map((item: any) => ({
      date: new Date(this.getDateValue(item)),
      value: 'sizeMB' in item ? item.sizeMB * 1000000 : item.value,
    }));

    return timeRange === 'year'
      ? this.groupByWeek(processedData)
      : this.groupByDay(processedData);
  }

  private groupByDay(data: TimelineDataPoint[]): TimelineDataPoint[] {
    const grouped = _.groupBy(
      data,
      (item) => new Date(item.date).toISOString().split('T')[0]
    );

    return Object.entries(grouped).map(([day, items]) => ({
      date: new Date(day).getTime(),
      value: _.sumBy(items, 'value'),
    }));
  }

  private getDateValue(item: any): Date | number {
    return item.date || item.creationDate || item.timestamp || new Date();
  }

  private getNumericValue(item: any): number {
    return item.sizeMB ? item.sizeMB * 1000000 : item.value || item.size || 0;
  }

  private getGroupKey(date: Date, timeRange: TimeRange): string {
    switch (timeRange) {
      case 'week':
      case 'month':
        return date.toISOString().split('T')[0];
      case 'year':
        const weekNum = this.getWeekNumber(date);
        return `${date.getFullYear()}-W${weekNum}`;
    }
  }
  /**
   * Parse group key to get correct date for visualization. If time range is year, it will return date of week
   * @param key 
   * @param timeRange 
   * @returns date as stored time value in milliseconds
   */
  private parseGroupKey(key: string, timeRange: TimeRange): number {
    if (timeRange === 'year' && key.includes('W')) {
      const [year, week] = key.split('-W');
      return this.getDateOfWeek(parseInt(year), parseInt(week)).getTime();
    }
    return new Date(key).getTime();
  }
  private groupByWeek(data: TimelineDataPoint[]): TimelineDataPoint[] {
    const grouped = _.groupBy(data, (item) => {
      const date = new Date(item.date);
      const week = new Date(date);
      week.setDate(date.getDate() - date.getDay() + 1);
      return week.toISOString();
    });

    return Object.entries(grouped).map(([week, items]) => ({
      date: new Date(week).getTime(),
      value: _.sumBy(items, 'value'),
    }));
  }
  /**
   * Calculate date of week.
   * @param year 
   * @param week week number as time value in milliseconds
   * @returns date of week
   */
  private getDateOfWeek(year: number, week: number): Date {
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + (week - 1) * 7);
    return date;
  }
  /**
   * 
   * @param date date of week
   * @returns calcculated week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
  /**
   * Decide what date format to use for axis and tooltip for XY charts
   */
  private getAxisFormat(timeRange: TimeRange): string {
    switch (timeRange) {
      case 'week':
      case 'month':
        return 'MMM dd';
      case 'year':
        return "MMM 'W'w";
    }
  }
  /**
   * Decide what tooltip format to use for XY charts
   */
  private getTooltipFormat(timeRange: TimeRange): string {
    switch (timeRange) {
      case 'week':
      case 'month':
        return "[bold]{valueY.formatNumber('#,##0.00 b')}[/]\n{valueX.formatDate('MMM dd')}";
      case 'year':
        return "[bold]{valueY.formatNumber('#,##0.00 b')}[/]\nWeek {valueX.formatDate('w')}";
      default:
        return 'Size: {valueY} MB';
    }
  }
  /**
   * Decide what date format to use for axis
   */
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
  /**
   * Either prepares the data for aggregation of backups by alert severity or groups the larger of the backups by category
   */
  preparePieData<T>(data: T): PieChartDataPoint[] {
    if (!data) return [];

    if (Array.isArray(data) && 'category' in (data[0] || {})) {
      const categoryColors: { [key: string]: string } = {
        OK: '#4caf50', // Green
        INFO: '#2196f3', // Blue
        WARNING: '#ffeb3b', // Yellow
        CRITICAL: '#f44336', // Red
      };

      return data.map((item: any) => ({
        category: item.category.toUpperCase(),
        value: item.count,
        count: item.count,
        fill: am5.color(
          categoryColors[item.category.toUpperCase()] || '#999999'
        ), // Default gray if category not found
      }));
    }

    if (Array.isArray(data) && 'startSize' in (data[0] || {})) {
      return this.prepareSizeDistributionData(data as any);
    } else {
      return [];
    }
  }
  private prepareSizeDistributionData(data: any[]): PieChartDataPoint[] {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return data.map((item) => ({
      category: this.createSizeCategory(item.startSize, item.endSize),
      count: item.count,
      value: (item.count / total) * 100, // Calculate percentage
    }));
  }

  private isAlertData(
    data: any
  ): data is { ok: number; info: number; warning: number; critical: number } {
    return (
      'ok' in data && 'info' in data && 'warning' in data && 'critical' in data
    );
  }

  private createSizeCategory(start: number, end: number): string {
    if (end === -1) {
      return `>${this.formatSize(start)}`;
    }
    return `${this.formatSize(start)} - ${this.formatSize(end)}`;
  }

  private formatSize(mb: number): string {
    if (mb >= 1000000) {
      return `${(mb / 1000000).toFixed(0)}TB`;
    }
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(0)}GB`;
    }
    return `${mb}MB`;
  }

  /**
   * Subscribes to data updates
   */
  private subscribeToData<T>(
    series: am5.Series,
    data$: Observable<T>,
    config: ChartConfig,
    timeRange?: TimeRange
  ): void {
    data$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (backups) => {
        series.data.clear();
        if (Array.isArray(backups) && backups.length) {
          const chartData =
            config.type === 'column'
              ? this.prepareColumnData(backups as any[], timeRange!)
              : this.preparePieData(backups);
          series.data.clear();
          series.data.setAll(chartData);
        }
      },
      error: (error) =>
        console.error(`Error updating ${config.type} chart:`, error),
    });
  }

  private getBaseInterval(timeRange: string): ITimeInterval {
    switch (timeRange) {
      case 'week':
        return { timeUnit: 'day', count: 1 };
      case 'month':
        return { timeUnit: 'day', count: 1 };
      case 'year':
        return { timeUnit: 'week', count: 1 };
      default:
        return { timeUnit: 'month', count: 1 };
    }
  }

  private animateChart(chart: am5.Chart, series: am5.Series): void {
    series.appear(1000);
    chart.appear(1000, 100);
  }

  /**
   * Updates Chart data
   */
  updateChart(chartId: string, data: any[]): void {
    const series = this.series[chartId];
    if (series) {
      series.data.setAll(data);
    }
  }

  /**
   * Updates time range for timeline charts
   */
  updateTimeRange(chartId: string, timeRange: TimeRange): void {
    const chart = this.charts[chartId];
    if (chart instanceof am5xy.XYChart) {
      const xAxis = chart.xAxes.getIndex(0);
      if (xAxis instanceof am5xy.DateAxis) {
        xAxis.set('baseInterval', this.getBaseInterval(timeRange));
        xAxis.set('tooltipDateFormat', this.getAxisFormat(timeRange));
      }
      const series = this.series[chartId];
      if (series?.get('tooltip')) {
        series
          .get('tooltip')
          ?.set('labelText', this.getTooltipFormat(timeRange));
      }
    }
  }
  /**
   * Handles charts if data is not available
   */
  private createModal(root: am5.Root, chartId: string): am5.Modal {
    const modal = am5.Modal.new(root, {
      content: 'No data available',
    });
    this.modals[chartId] = modal;
    return modal;
  }

  private chartHasNoDataHandler(
    series: am5.Series,
    config: ChartConfig,
    chartType: ChartType
  ) {
    const modal = this.modals[config.id];

    series.events.on('datavalidated', (ev) => {
      const currentSeries = ev.target;
      const hasData = currentSeries.data.length > 0;

      if (series instanceof am5xy.ColumnSeries) {
        const xAxis = series.get('xAxis');
        const yAxis = series.get('yAxis');

        if (
          xAxis instanceof am5xy.DateAxis &&
          yAxis instanceof am5xy.ValueAxis
        ) {
          // Handle axis labels visibility
          xAxis.get('renderer').labels.template.setAll({
            forceHidden: !hasData,
          });
          yAxis.get('renderer').labels.template.setAll({
            forceHidden: !hasData,
          });

          // Handle grid visibility
          xAxis.get('renderer').grid.template.setAll({
            forceHidden: !hasData,
          });
          yAxis.get('renderer').grid.template.setAll({
            forceHidden: !hasData,
          });
        }

        // Handle series visibility
        series.columns.template.setAll({
          forceHidden: !hasData,
        });
      } else if (series instanceof am5percent.PieSeries) {
        if (!hasData) {
          const placeholder = Array(3)
            .fill(null)
            .map(() => ({
              [series.get('categoryField') || 'category']: '',
              [series.get('valueField') || 'value']: 1,
            }));
          series.data.setAll(placeholder);
        }

        series.labels.template.set('forceHidden', !hasData);
        series.ticks.template.set('forceHidden', !hasData);

        series.slices.template.setAll({
          fillOpacity: hasData ? 1 : 0.2,
          stroke: hasData ? series.get('stroke') : am5.color(0xcccccc),
          strokeOpacity: hasData ? 1 : 0.5,
        });
      }
      if (!hasData) {
        modal?.open();
      } else {
        modal?.close();
      }
    });
  }

  dispose(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.roots).forEach((root) => root.dispose());
    this.roots = {};
    this.charts = {};
    this.series = {};
    this.modals = {};
  }
}
