import { BackupType } from '../enums/backup.types';

export type BackupFilterParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  fromDate?: string | null;
  toDate?: string | null;
  fromSizeMB?: number | null;
  toSizeMB?: number | null;
  id?: string | null;
  taskId?: string[] | null;
  taskName?: string | null;
  saveset?: string | null;
  types?: BackupType[] | null;
  fromScheduledDate?: string | null;
  toScheduledDate?: string | null;
};
