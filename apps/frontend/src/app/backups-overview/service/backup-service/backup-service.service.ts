import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { BASE_URL } from '../../../shared/types/configuration';
import { Backup } from '../../../shared/types/backup';
import { APIResponse } from '../../../shared/types/api-response';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';
import { BackupTask } from '../../../shared/types/backup.task';

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
    selectedTasks?: string[]
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

    if (filterParams.types && filterParams.types.length > 0) {
      filterParams.types.forEach((type) => {
        cleanParams[`types`] = filterParams.types!;
      });
    }

    const params = new HttpParams({ fromObject: cleanParams });
    const body = {
      taskIds: selectedTasks,
    };

    return this.http
      .post<APIResponse<Backup>>(`${this.baseUrl}/backupData/filter`, body, {
        params: params,
      })
      .pipe(shareReplay(1));
  }

  getAllBackupTasks(): Observable<BackupTask[]> {
    return this.http.get<BackupTask[]>(`${this.baseUrl}/tasks`);
  }
}
