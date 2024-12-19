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
        this.dataStores = dataStores;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
