export interface DataStore {
  id: string;
  displayName: string;
  capacity: number;
  highWaterMark: number;
  filled: number;
}
