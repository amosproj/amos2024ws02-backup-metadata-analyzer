import { SeverityType } from "../enums/severityType";
import { Alert } from "./alert";

export interface AlertOccurrence {
    date: Date;
    details: string;
    severity: SeverityType;
  }
  
export interface RepeatedAlert {
    type: string;
    count: number;
    latestAlert?: Alert;
    history?: AlertOccurrence[];
    taskId?: string;    // For task-related alerts
    storageId?: string; // For storage-related alerts
  }
  
export interface AlertSummary {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    totalCount: number;
    repeatedAlerts: RepeatedAlert[];
    mostFrequentAlert?: RepeatedAlert;
  }