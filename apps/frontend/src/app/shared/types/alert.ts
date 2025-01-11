import { Backup } from './backup';
import { AlertType } from './alertType';

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

export interface MissingBackupAlert extends Alert {
  referenceDate: Date;
}

export interface AdditionalBackupAlert extends Alert {
  date: Date;
}
