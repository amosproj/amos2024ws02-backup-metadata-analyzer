import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationSettings } from '../../shared/types/notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  // Lade aktuelle Einstellungen
  getNotificationSettings(): Observable<NotificationSettings[]> {
    return this.http.get<NotificationSettings[]>(
      `${this.baseUrl}/alerting/type`
    );
  }

  // Speichere neue Einstellungen
  updateNotificationSettings(
    notification: NotificationSettings
  ): Observable<NotificationSettings> {

    if (notification.user_active) {
      return this.http.patch<NotificationSettings>(
        `${this.baseUrl}/alerting/type/${notification.id}/activate/user`,
        { params: notification }
      );
    } else {
      return this.http.patch<NotificationSettings>(
        `${this.baseUrl}/alerting/type/${notification.id}/deactivate/user`,
        { params: notification }
      );
    }
  }
}
