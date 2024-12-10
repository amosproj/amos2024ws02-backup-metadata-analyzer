import { BackupTask } from './backup.task';

export interface Backup {
  id: string;
  saveset: string;
  sizeMB: number;
  creationDate: Date;
  taskId?: BackupTask;
}
