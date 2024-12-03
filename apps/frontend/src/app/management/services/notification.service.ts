import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertType } from '../../shared/types/alertType';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  // Lade aktuelle Einstellungen
  getNotificationSettings(): Observable<AlertType[]> {
    return this.http.get<AlertType[]>(`${this.baseUrl}/alerting/type`);
  }

  // Speichere neue Einstellungen
  updateNotificationSettings(notification: AlertType): Observable<AlertType> {
    return this.http.patch<AlertType>(
      `${this.baseUrl}/alerting/type/${notification.id}/user`,
      { params: notification.user_active }
    );
  }
}
