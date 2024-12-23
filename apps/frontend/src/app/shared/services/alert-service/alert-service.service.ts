import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Alert } from '../../types/alert';

@Injectable({
  providedIn: 'root',
})
export class AlertServiceService {
  private refreshAlerts = new Subject<void>();
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllAlerts(days?: number): Observable<Alert[]> {
    if (days) {
      return this.http.get<Alert[]>(`${this.baseUrl}/alerting?days=${days}`);
    }
    return this.http.get<Alert[]>(`${this.baseUrl}/alerting`);
  }

  refresh() {
    this.refreshAlerts.next();
  }

  getRefreshObservable() {
    return this.refreshAlerts.asObservable();
  }
}
