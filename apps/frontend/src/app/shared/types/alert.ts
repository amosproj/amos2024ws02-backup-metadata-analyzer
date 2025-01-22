import { Backup } from './backup';
import { AlertType } from './alertType';
import { BackupType } from '../enums/backup.types';

export interface Alert {
  id: string;
  alertType: AlertType;
  backup?: Backup;
  creationDate: Date;
}

export interface SizeAlert extends Alert {
  size: number;
  referenceSize: number;
}

export interface CreationDateAlert extends Alert {
  date: Date;
  referenceDate: Date;
}

export interface StorageFillAlert extends Alert {
  dataStoreName: string;
  filled: number;
  highWaterMark: number;
  capacity: number;
}