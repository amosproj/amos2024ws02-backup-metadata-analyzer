import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Alert } from '../../types/alert';

@Injectable({
  providedIn: 'root',
})
export class AlertServiceService {
  private readonly refreshAlerts = new Subject<void>();
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllAlerts(fromDate?: string, offset?: number): Observable<{ alerts: Alert[], total: number }> {
    if (fromDate) {
      return this.http.get<{ data: Alert[], paginationData: { total: number } }>(`${this.baseUrl}/alerting?offset=0&limit=10&fromDate=${fromDate}`).pipe(
        map(response => ({
          alerts: response.data,
          total: response.paginationData.total
        }))
      );
    }
    return this.http.get<{ data: Alert[], paginationData: { total: number } }>(`${this.baseUrl}/alerting`).pipe(
      map(response => ({
        alerts: response.data,
        total: response.paginationData.total
      }))
    );
  }

  refresh() {
    this.refreshAlerts.next();
  }

  getRefreshObservable() {
    return this.refreshAlerts.asObservable();
  }
}
