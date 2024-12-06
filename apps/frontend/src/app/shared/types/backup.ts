export interface Backup {
  id: string;
  sizeMB: number;
  creationDate: Date;
  taskId?: string;
}
