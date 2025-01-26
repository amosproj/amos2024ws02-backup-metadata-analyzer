import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay, Subject, tap } from 'rxjs';
import { BASE_URL } from '../../types/configuration';
import { Backup } from '../../types/backup';
import { APIResponse } from '../../types/api-response';
import { BackupFilterParams } from '../../types/backup-filter-type';
import { BackupTask } from '../../types/backup.task';
import {
  PieChartDataPoint,
  TimelineDataPoint,
  AlertSeverityOverview
} from '../../types/chart-config';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private readonly refreshBackups = new Subject<void>();

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getAllBackups(
    filterParams: BackupFilterParams & { taskIds?: string[] },
    selectedTasks?: string[]
  ): Observable<APIResponse<Backup>> {
    let cleanParams = this.cleanParams(filterParams);

    if (filterParams.types && filterParams.types.length > 0) {
      filterParams.types.forEach((type) => {
        cleanParams = cleanParams.set('types', type);
      });
    }
    const body = {
      taskIds: selectedTasks,
    };

    return this.http
      .post<APIResponse<Backup>>(`${this.baseUrl}/backupData/filter`, body, {
        params: cleanParams,
      })
      .pipe(shareReplay(1));
  }

  getAllBackupTasks(): Observable<BackupTask[]> {
    return this.http.get<BackupTask[]>(`${this.baseUrl}/tasks`);
  }

  getBackupSizesPerDay(
    filterParams: BackupFilterParams & { taskIds?: string[] },
    selectedTasks?: string[]
  ): Observable<TimelineDataPoint[]> {
    const cleanParams = this.cleanParams(filterParams);
    const body = {
      taskIds: selectedTasks,
    };
    return this.http.post<TimelineDataPoint[]>(
      `${this.baseUrl}/backupData/sizes/perDay`,
      body,
      {
        params: cleanParams,
      }
    );
  }

  getGroupedBackupSizes(
    filterParams: BackupFilterParams & { taskIds?: string[] },
    selectedTasks?: string[]
  ): Observable<PieChartDataPoint[]> {
    const cleanParams = this.cleanParams(filterParams);
    const body = {
      taskIds: selectedTasks,
    };
    return this.http.post<PieChartDataPoint[]>(
      `${this.baseUrl}/backupData/sizes/grouped`,
      body,
      {
        params: cleanParams,
      }
    );
  }

  getBackupAlertSeverityOverview(): Observable<AlertSeverityOverview> {
    return this.http.get<AlertSeverityOverview>(
      `${this.baseUrl}/alerting/severityOverview`
    );
  }

  refresh() {
    this.refreshBackups.next();
  }

  getRefreshObservable() {
    return this.refreshBackups.asObservable();
  }

  private cleanParams(filterParams: BackupFilterParams): HttpParams {
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
    return params;
  }
}
