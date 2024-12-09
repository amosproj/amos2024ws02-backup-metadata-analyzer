export interface Backup {
  id: string;
  saveset: string;
  sizeMB: number;
  creationDate: Date;
  taskId?: {
    id: string;
    displayName: string;
  };
}
