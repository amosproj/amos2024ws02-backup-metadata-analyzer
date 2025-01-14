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
  }