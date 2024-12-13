import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { BASE_URL } from '../../../shared/types/configuration';
import { Backup } from '../../../shared/types/backup';
import { APIResponse } from '../../../shared/types/api-response';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';
import { BackupTask } from '../../../shared/types/backup.task';
import { BackupType } from '../../../shared/enums/backup.types';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllBackups(
    filterParams: BackupFilterParams & { taskIds?: string[] },
    selectedTasks?: string[], selectedTypes?: BackupType[]
  ): Observable<APIResponse<Backup>> {
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

    if (selectedTypes && selectedTypes.length > 0) {
      cleanParams['types'] = selectedTypes;
    }

    const params = new HttpParams({ fromObject: cleanParams });
    const body = {
      taskIds: selectedTasks,
    };

    return this.http
      .post<APIResponse<Backup>>(`${this.baseUrl}/backupData/filter`, body, {
        params: params,
      })
      .pipe(shareReplay(1), tap((elem) => console.log(elem)));
  }

  getAllBackupTasks(): Observable<BackupTask[]> {
    return this.http.get<BackupTask[]>(`${this.baseUrl}/tasks`);
  }
}
