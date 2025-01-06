import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../types/configuration';

@Injectable({
  providedIn: 'root',
})
export class AnalyzerService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  refresh(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/analyzer/refresh`, {});
  }
}
