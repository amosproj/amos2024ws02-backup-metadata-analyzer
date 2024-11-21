import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../../shared/types/alert';

@Injectable({
  providedIn: 'root',
})
export class AlertServiceService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllAlerts(id: string): Observable<Alert> {
    return this.http.get<Alert>(`${this.baseUrl}/alerting}`);
  }
}
