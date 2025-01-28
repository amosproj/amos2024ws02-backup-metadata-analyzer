export type ChartType = 'timeline' | 'pie' | 'column';
export type TimeRange = 'week' | 'month' | 'year';



export interface ChartConfig {
    id: string;
    type: ChartType;
    height?: number;
    tooltipText?: string;
    valueYField?: string;
    valueXField?: string;
    categoryField?: string;
    valueField?: string;
    seriesName?: string;
    hideLabels?: boolean,
  }


export interface TimelineDataPoint {
  date: Date | number;
  value: number;
}

export interface PieChartDataPoint {
  category: string;
  value?: number;
  count?: number;
}

export interface AlertSeverityOverview {
  ok: number;
  info: number;
  warning: number;
  critical: number;
}