import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../../shared/types/configuration';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
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

  updateEmailReceiver(email: Partial<EmailType>): Observable<EmailType> {
    return this.http
      .post<EmailType>(`${this.baseUrl}/mail`, {
        mail: email.mail,
      })
      .pipe(catchError(this.handleError));
  }

  deleteEmail(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/mail/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage =
        error.status === 409
          ? 'Email already exists'
          : `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => error);
  }
}
