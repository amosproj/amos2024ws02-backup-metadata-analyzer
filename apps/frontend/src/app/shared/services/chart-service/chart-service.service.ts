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
  PieChartData,
  TimelineData,
  TimeRange,
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
  createChart(
    config: ChartConfig,
    data$: Observable<TimelineData[] | PieChartData[]>,
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
   * create series for charts
   * @param chart
   * @param config
   * @param root
   * @param timeRange
   * @returns series to visualize data
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
          valueYField: config.valueYField || 'sizeMB',
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
          legendValueText: '{value} backups',
          legendLabelText: '{category}',
        })
      );
      this.chartHasNoDataHandler(series, config, 'pie');

      return series;
    }
    throw new Error('Unsupported chart configuration');
  }

  /**
   * ChartControls
   * @param chart selected chart
   * @param config chart config
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
  prepareColumnData(backups: TimelineData[], timeRange: TimeRange): any[] {
    if (!backups?.length) return [];

    const processedData = backups.map((backup) => ({
      date: new Date(backup.date),
      sizeMB: Number(backup.sizeMB) * 1000000,
    }));

    // Sort data by date
    const sortedData = _.sortBy(processedData, 'date');

    if (timeRange === 'year') {
      const groupedByWeek = _.groupBy(sortedData, (backup) => {
        const date = backup.date;
        const startOfWeek = new Date(date);
        startOfWeek.setDate(
          date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
        );
        return startOfWeek.toISOString().split('T')[0];
      });

      return Object.entries(groupedByWeek).map(([weekStart, backups]) => ({
        date: new Date(weekStart).getTime(),
        sizeMB: _.sumBy(backups, 'sizeMB'),
      }));
    } else {
      // Group by day for month/week view
      const groupedByDay = _.groupBy(
        sortedData,
        (backup) => backup.date.toISOString().split('T')[0]
      );

      return Object.entries(groupedByDay).map(([day, backups]) => ({
        date: new Date(day).getTime(),
        sizeMB: _.sumBy(backups, 'sizeMB'),
      }));
    }
  }

  private getAxisFormat(timeRange: TimeRange): string {
    switch (timeRange) {
      case 'week':
      case 'month':
        return 'MMM dd';
      case 'year':
        return "MMM 'W'w";
    }
  }

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

  preparePieData(backups: PieChartData[]): any[] {
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
    data$: Observable<TimelineData[] | PieChartData[]>,
    config: ChartConfig,
    timeRange?: TimeRange
  ): void {
    data$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (backups) => {
        series.data.clear();
        if (backups?.length) {
          const chartData =
            config.type === 'column'
              ? this.prepareColumnData(backups as TimelineData[], timeRange!)
              : this.preparePieData(backups as PieChartData[]);
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
