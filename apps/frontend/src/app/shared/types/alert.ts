import { Backup } from './backup';
import { AlertType } from '../enums/alertType';

export interface Alert {
  id: string;
  type: AlertType;
  value: number;
  referenceValue: number;
  backup: Backup;
}
