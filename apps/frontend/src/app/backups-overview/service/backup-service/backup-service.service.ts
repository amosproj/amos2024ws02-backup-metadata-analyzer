import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { BASE_URL } from '../../../shared/types/configuration';
import { Backup } from '../../../shared/types/backup';
import { APIResponse } from '../../../shared/types/api-response';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllBackups(filterParams: BackupFilterParams): Observable<Backup[]> {
    const mapToBackup = (data: Backup): Backup => {
      console.log(data.creationDate);
      return {
        id: data.id,
        sizeMB: data.sizeMB,
        creationDate: data.creationDate,
      };
    };

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
      .get<APIResponse>(`${this.baseUrl}/backupData`, { params: params })
      .pipe(
        map((response) => {
          return response.data.map(mapToBackup);
        })
      )
      .pipe(shareReplay(1));
  }
  getTotalBackupsCount(): Observable<number> {
    console.log('get total count');
    return this.http.get<APIResponse>(`${this.baseUrl}/backupData`).pipe(
      map((response) => {
        console.log('total count === ', response.paginationData.total);
        return response.paginationData.total;
      })
    );
  }
}
