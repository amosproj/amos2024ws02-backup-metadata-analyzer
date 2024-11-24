export interface APIResponse<T> {
  data: T[];
  paginationData: PaginationData;
}

export interface PaginationData {
  offset?: number;
  limit?: number;
  total: number;
}
