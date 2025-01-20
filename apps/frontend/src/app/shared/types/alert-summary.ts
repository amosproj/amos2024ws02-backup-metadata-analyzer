import { SeverityType } from '../enums/severityType';
import { Alert } from './alert';

// Interface for the history items in repeated alerts
export interface AlertHistoryItem {
  date: string;
  alertId: string;
}

// Interface for repeated alerts
export interface RepeatedAlert {
  severity: SeverityType;
  type: string;
  taskId: string;
  displayName: string;
  count: string;
  latestAlert: Alert;
  history: AlertHistoryItem[];
  firstOccurence: string;

}

// Main interface for alert summary from backend
export interface AlertSummary {
  infoAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  repeatedAlerts: RepeatedAlert[];
  mostFrequentAlert: RepeatedAlert;
}
