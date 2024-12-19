import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStoresService } from '../service/data-stores-service.service';
import { Subject, takeUntil } from 'rxjs';
import { DataStore } from '../../shared/types/data-store';

@Component({
  selector: 'app-data-stores',
  templateUrl: './data-stores.component.html',
  styleUrl: './data-stores.component.css',
})
export class DataStoresComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  dataStores: DataStore[] = [];

  constructor(private readonly dataStoresService: DataStoresService) {}

  ngOnInit(): void {
    this.dataStoresService
      .getAllDataStores()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dataStores) => {
        this.dataStores = dataStores.sort(
          (a, b) => this.getFilledPercentage(b) - this.getFilledPercentage(a)
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFilledPercentage(dataStore: DataStore): number {
    return parseFloat(
      ((dataStore.filled / dataStore.capacity) * 100).toFixed(1)
    );
  }

  getHighWaterMarkPercentage(dataStore: DataStore): number {
    return parseFloat(
      ((dataStore.highWaterMark / dataStore.capacity) * 100).toFixed(2)
    );
  }
}
