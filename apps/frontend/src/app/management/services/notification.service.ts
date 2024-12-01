import { Inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationSettings } from '../../shared/types/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(    @Inject(BASE_URL) private readonly baseUrl: string,
  private readonly http: HttpClient) { }

      // Lade aktuelle Einstellungen
      getNotificationSettings(): Observable<NotificationSettings> {
        return this.http.get<NotificationSettings>(this.baseUrl); // add url path to load settings
    }

    // Speichere neue Einstellungen
    updateNotificationSettings(settings: NotificationSettings): Observable<NotificationSettings> {
        return this.http.put<NotificationSettings>(this.baseUrl, {params: settings});
    }

}
