import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BASE_URL } from '../../types/configuration';
import { AlertServiceService } from '../alert-service/alert-service.service';
import { DataStoresService } from '../data-stores-service/data-stores-service.service';
import { BackupService } from '../backup-service/backup-service.service';
import { InformationServiceService } from '../information-service/information-service.service';

@Injectable({
  providedIn: 'root',
})
export class AnalyzerService {
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient,
    private readonly alertService: AlertServiceService,
    private readonly dataStoresService: DataStoresService,
    private readonly backupService: BackupService,
    private readonly informationService: InformationServiceService
  ) {}

  refresh(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/analyzer/refresh`, {}).pipe(
      tap(() => {
        this.alertService.refresh();
        this.dataStoresService.refresh();
        this.backupService.refresh();
        this.informationService.refresh();
      })
    );
  }
}
