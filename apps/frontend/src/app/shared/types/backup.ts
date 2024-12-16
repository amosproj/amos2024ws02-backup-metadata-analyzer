import { BackupTask } from './backup.task';
import { BackupType } from '../enums/backup.types';

export interface Backup {
  id: string;
  saveset: string;
  sizeMB: number;
  creationDate: Date;
  taskId?: BackupTask;
  type: BackupType;
}
