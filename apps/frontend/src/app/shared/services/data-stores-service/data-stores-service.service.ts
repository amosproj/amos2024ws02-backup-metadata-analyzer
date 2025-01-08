import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DataStore } from '../../types/data-store';
import { BASE_URL } from '../../types/configuration';

@Injectable({
  providedIn: 'root',
})
export class DataStoresService {
  private readonly refreshDataStores = new Subject<void>();

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllDataStores(): Observable<DataStore[]> {
    return this.http.get<DataStore[]>(`${this.baseUrl}/dataStores`);
  }

  refresh() {
    this.refreshDataStores.next();
  }

  getRefreshObservable() {
    return this.refreshDataStores.asObservable();
  }
}
