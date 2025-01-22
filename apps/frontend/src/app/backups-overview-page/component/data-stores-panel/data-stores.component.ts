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
  private readonly destroy$ = new Subject<void>();
  dataStores$: Observable<DataStore[]> = of([]);

  showAll = false;
  sortBy: 'filled' | 'overflowTime' = 'filled';

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDataStores(): void {
    this.dataStores$ = this.dataStoresService.getAllDataStores().pipe(
      takeUntil(this.destroy$),
      map((dataStores) => this.sortDataStores(dataStores)),
      shareReplay(1)
    );
  }

  getFilledPercentage(dataStore: DataStore): number {
    return parseFloat(
      ((dataStore.filled / dataStore.capacity) * 100).toFixed(1)
    );
  }

  getHighWaterMarkPercentage(dataStore: DataStore): number {
    const percentage = parseFloat(
      ((dataStore.highWaterMark / dataStore.capacity) * 100).toFixed(2)
    );
    return percentage > 100 ? 100 : percentage;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  sortDataStores(dataStores: DataStore[]): DataStore[] {
    return dataStores.sort((a, b) => {
      if (this.sortBy === 'filled') {
        return this.getFilledPercentage(b) - this.getFilledPercentage(a);
      } else {
        return (a.overflowTime ?? Infinity) - (b.overflowTime ?? Infinity);
      }
    });
  }

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

  changeSortBy(event: Event) {
    const element = event.target as HTMLSelectElement;
    this.sortBy = element.value as 'filled' | 'overflowTime';
    this.loadDataStores();
  }
}
