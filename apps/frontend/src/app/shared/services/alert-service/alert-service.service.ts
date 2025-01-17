import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../types/configuration';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, share, shareReplay } from 'rxjs/operators';
import { Alert } from '../../types/alert';
import { AlertFilterParams } from '../../types/alert-filter-type';
import { APIResponse } from '../../types/api-response';

@Injectable({
  providedIn: 'root',
})
export class AlertServiceService {
  private readonly refreshAlerts = new Subject<void>();
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllAlerts(
    filterParams: AlertFilterParams
  ): Observable<APIResponse<Alert>> {
    const cleanParams = Object.fromEntries(
      Object.entries(filterParams).filter(
        ([_, value]) => value != null && value !== undefined
      )
    ) as {
      [param: string]:
        | string
        | number
        | boolean
        | readonly (string | number | boolean)[];
    };

    const params = new HttpParams({ fromObject: cleanParams });

    return this.http
      .get<APIResponse<Alert>>(`${this.baseUrl}/alerting`, {
        params: params,
      })
      .pipe(shareReplay(1));
  }

  refresh() {
    this.refreshAlerts.next();
  }

  getRefreshObservable() {
    return this.refreshAlerts.asObservable();
  }
}
