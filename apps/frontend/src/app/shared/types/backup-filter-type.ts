export type BackupFilterParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  fromDate?: string | null;
  toDate?: string | null;
  fromSizeMB?: number | null;
  toSizeMB?: number | null;
};
