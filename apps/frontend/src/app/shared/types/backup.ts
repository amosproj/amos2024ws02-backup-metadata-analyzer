export interface Backup {
  id: string;
  savesetName: string;
  sizeMB: number;
  creationDate: Date;
  taskId?: {
    id: string;
    displayName: string;
  };
}
