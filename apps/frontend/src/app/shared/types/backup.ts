import { BackupTask } from './backup.task';

export interface Backup {
  id: string;
  sizeMB: number;
  creationDate: Date;
  taskId?: BackupTask;
}
