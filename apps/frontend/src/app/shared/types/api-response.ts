import { Backup } from './backup';

export interface APIResponse {
  data: Backup[];
  paginationData: PaginationData;
}

export interface PaginationData {
  limit?: string;
  total: number;
}
