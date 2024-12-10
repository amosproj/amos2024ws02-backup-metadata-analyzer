import { Backup } from './backup';
import { AlertType } from './alertType';

export interface Alert {
  id: string;
  alertType: AlertType;
  backup?: Backup;
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
  storageFill: number;
  referenceStorageFill: number;
}
