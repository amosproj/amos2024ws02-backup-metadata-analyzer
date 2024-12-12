import { BackupTask } from './backup.task';
import { BackupType } from './backupType';

export interface Backup {
  id: string;
  saveset: string;
  sizeMB: number;
  creationDate: Date;
  taskId?: BackupTask;
  type: BackupType;
}
