import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailType } from '../../../shared/types/email';

@Injectable({
  providedIn: 'root',
})
export class EmailReceiverService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllEmailReceiver(): Observable<EmailType[]> {
    return this.http.get<EmailType[]>(`${this.baseUrl}/mail`);
  }

  updateEmailReceiver(email: EmailType): Observable<EmailType> {
    return this.http.post<EmailType>(`${this.baseUrl}/mail`, {
      mail: email.mail,
    });
  }

  deleteEmail(email: EmailType): Observable<EmailType> {
    return this.http.delete<EmailType>(`${this.baseUrl}/mail`);
  }
}
