import { Backup } from './backup';

export interface APIResponse {
  data: Backup[];
  paginatorSite: Paginator;
}

export interface Paginator {
  offset?: string;
  limit?: string;
  total: number;
}
