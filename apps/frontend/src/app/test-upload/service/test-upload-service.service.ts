import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BASE_URL } from '../../shared/types/configuration';
import { Backup } from '../../shared/types/backup';

@Injectable({
  providedIn: 'root',
})
export class TestUploadServiceService {
  public uploadNewID: string = '';
  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getData(id: string): Observable<Backup> {
    return this.http.get<Backup>(`${this.baseUrl}/backupData/${id}`);
  }
}
