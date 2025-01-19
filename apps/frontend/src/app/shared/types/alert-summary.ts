import { SeverityType } from '../enums/severityType';
import { Alert } from './alert';

// Interface for the history items in repeated alerts
export interface AlertHistoryItem {
  date: string;
  alertId: string;
}

// Interface for repeated alerts
export interface RepeatedAlert {
  latestAlert: any;
  severity: SeverityType;
  type: string;
  taskId: string;
  count: string;
  history: AlertHistoryItem[];
}

// Main interface for alert summary from backend
export interface AlertSummary {
  infoAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  repeatedAlerts: RepeatedAlert[];
  mostFrequentAlert: RepeatedAlert;
}

export interface AlertSeverityStatistic {
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
}