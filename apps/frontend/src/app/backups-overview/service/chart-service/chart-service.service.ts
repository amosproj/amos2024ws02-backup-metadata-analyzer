import { Injectable } from '@angular/core';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ITimeInterval } from '@amcharts/amcharts5/.internal/core/util/Time';
import { Backup } from '../../../shared/types/backup';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  ChartConfig,
  ChartType,
  TimeRange,
} from '../../../shared/types/chart-config';

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
   */
  private createAxes(
    chart: am5xy.XYChart,
    root: am5.Root,
    timeRange: TimeRange
  ) {
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        numberFormat: "#.#'MB'",
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

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: config.seriesName || 'Backups',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: config.valueYField || 'sizeMB',
          valueXField: config.valueXField || 'creationDate',
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

  prepareColumnData(backups: Backup[], timeRange: TimeRange): any[] {
    if (!backups?.length) return [];

    backups = backups.map((backup) => {
      return {
        ...backup,
        sizeMB: Math.floor(backup.sizeMB),
      };
    });
    const sortedBackups = [...backups].sort(
      (a, b) =>
        new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
    );

    const groupedData = new Map<string, number>();

    sortedBackups.forEach((backup) => {
      const date = new Date(backup.creationDate);
      const key = this.getGroupKey(date, timeRange);
      groupedData.set(key, (groupedData.get(key) || 0) + backup.sizeMB);
    });

    return Array.from(groupedData.entries()).map(([key, total]) => ({
      creationDate: this.parseGroupKey(key, timeRange),
      sizeMB: total,
    }));
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

  private parseGroupKey(key: string, timeRange: TimeRange): number {
    if (timeRange === 'year' && key.includes('W')) {
      const [year, week] = key.split('-W');
      return this.getDateOfWeek(parseInt(year), parseInt(week)).getTime();
    }
    return new Date(key).getTime();
  }

  private getDateOfWeek(year: number, week: number): Date {
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + (week - 1) * 7);
    return date;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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
        return "[bold]{valueY}[/] MB\n{valueX.formatDate('MMM dd')}";
      case 'year':
        return "[bold]{valueY}[/] MB\nWeek {valueX.formatDate('w')}";
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

  preparePieData(backups: Backup[]): any[] {
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
    data$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (backups) => {
        series.data.clear();

        if (backups?.length) {
          const chartData =
            config.type === 'column'
              ? this.prepareColumnData(backups, timeRange!)
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
        return { timeUnit: 'hour', count: 4 };
      case 'month':
        return { timeUnit: 'day', count: 1 };
      case 'year':
        return { timeUnit: 'week', count: 1 };
      default:
        return { timeUnit: 'month', count: 1 };
    }
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
