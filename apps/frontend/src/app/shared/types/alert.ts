import { Backup } from './backup';
import { AlertType } from './alertType';

export interface Alert {
  id: string;
  alertType: AlertType;
  backup: Backup;
}

export interface SizeAlert extends Alert {
  size: number;
  referenceSize: number;
}
