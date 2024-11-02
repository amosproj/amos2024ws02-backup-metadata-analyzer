import { Backup } from './backup';

export interface APIResponse {
  data: Backup[];
  paginatorSite: number[];
}
