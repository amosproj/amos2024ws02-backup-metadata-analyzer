import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertType } from '../../../shared/types/alertType';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}
  /**
   * Get all notification settings
   * @returns Observable<AlertType[]>
   */
  getNotificationSettings(): Observable<AlertType[]> {
    return this.http.get<AlertType[]>(`${this.baseUrl}/alerting/type`);
  }
  /**
   * Update notification settings
   * @param notification ressource to update
   * @returns 
   */
  updateNotificationSettings(notification: AlertType): Observable<AlertType> {
    return this.http.patch<AlertType>(
      `${this.baseUrl}/alerting/type/${notification.id}/user`,
      { status: notification.user_active }
    );
  }
}
