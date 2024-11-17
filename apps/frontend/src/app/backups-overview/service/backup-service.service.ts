import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { BASE_URL } from '../../shared/types/configuration';
import { Backup } from '../../shared/types/backup';
import { APIResponse } from '../../shared/types/api-response';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllBackups(options?: HttpParams): Observable<Backup[]> {
    const mapToBackup = (data: Backup): Backup => {
      return {
        id: data.id,
        sizeMB: data.sizeMB,
        creationDate: data.creationDate,
      };
    };
    return this.http
      .get<APIResponse>(`${this.baseUrl}/backupData`, { params: options })
      .pipe(
        map((response) => {
          return response.data.map(mapToBackup);
        })
      )
      .pipe(shareReplay(1));
  }
}
