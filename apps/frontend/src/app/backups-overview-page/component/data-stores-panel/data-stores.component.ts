import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStoresService } from '../../../shared/services/data-stores-service/data-stores-service.service';
import { map, Observable, of, shareReplay, Subject, takeUntil } from 'rxjs';
import { DataStore } from '../../../shared/types/data-store';

@Component({
  selector: 'app-data-stores',
  templateUrl: './data-stores.component.html',
  styleUrl: './data-stores.component.css',
})
export class DataStoresComponent implements OnDestroy, OnInit {
  showAll = false;
  sortBy: 'filled' | 'overflowTime' = 'filled';

  dataStores$: Observable<DataStore[]> = of([]);
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly dataStoresService: DataStoresService) {}

  ngOnInit() {
    this.loadDataStores();
    this.dataStoresService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDataStores();
      });
  }
  /**
   * Loads the data stores and updates the dataStores$
   */
  loadDataStores(): void {
    this.dataStores$ = this.dataStoresService.getAllDataStores().pipe(
      takeUntil(this.destroy$),
      map((dataStores) => this.sortDataStores(dataStores)),
      shareReplay(1)
    );
  }
  /**
   * Calculates the filled percentage of a data store
   * @param dataStore information about the data store
   * @returns percantage of filled capacity
   */
  getFilledPercentage(dataStore: DataStore): number {
    return parseFloat(
      ((dataStore.filled / dataStore.capacity) * 100).toFixed(1)
    );
  }
  /**
   * Calculates the percentage of high water mark of a data store
   * @param dataStore information about the data store
   * @returns percentage of high water mark
   */
  getHighWaterMarkPercentage(dataStore: DataStore): number {
    const percentage = parseFloat(
      ((dataStore.highWaterMark / dataStore.capacity) * 100).toFixed(2)
    );
    return percentage > 100 ? 100 : percentage;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }
  /**
   * Sorts the data stores by filled or overflow time
   * @param dataStores Array of data stores
   * @returns sorted array of data stores
   */
  sortDataStores(dataStores: DataStore[]): DataStore[] {
    return dataStores.sort((a, b) => {
      if (this.sortBy === 'filled') {
        return this.getFilledPercentage(b) - this.getFilledPercentage(a);
      } else {
        return (a.overflowTime ?? Infinity) - (b.overflowTime ?? Infinity);
      }
    });
  }
  /**
   * Selects the label for the overflow time if needed
   * @param overflowTime numbber of days until overflow
   * @returns setting for the label
   */
  getOverflowTimeLabel(overflowTime?: number): string {
    if (overflowTime === undefined) {
      return 'N/A';
    }

    if (overflowTime === 1) {
      return `${overflowTime} day`;
    } else if (overflowTime > 365) {
      return `> 1 year`;
    } else if (overflowTime === 0) {
      return `Now`;
    }
    return `${overflowTime} days`;
  }
  /**
   * Changes the sort by setting and reloads the data stores
   * @param event DOM event
   */
  changeSortBy(event: Event) {
    const element = event.target as HTMLSelectElement;
    this.sortBy = element.value as 'filled' | 'overflowTime';
    this.loadDataStores();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
