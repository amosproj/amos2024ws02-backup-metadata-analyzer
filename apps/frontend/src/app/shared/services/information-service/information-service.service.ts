import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BASE_URL } from '../../types/configuration';
import { BasicInformation } from '../../types/basicInformation';

@Injectable({
  providedIn: 'root',
})
export class InformationServiceService {
  private readonly refreshInformation = new Subject<void>();

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getBasicInformations(): Observable<BasicInformation> {
    return this.http.get<BasicInformation>(`${this.baseUrl}/information`);
  }

  refresh() {
    this.refreshInformation.next();
  }

  getRefreshObservable() {
    return this.refreshInformation.asObservable();
  }
}
