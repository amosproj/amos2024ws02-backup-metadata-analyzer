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
};
