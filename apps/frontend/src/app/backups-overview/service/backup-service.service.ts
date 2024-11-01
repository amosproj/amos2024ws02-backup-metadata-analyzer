import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface BackupData {
  id: string;
  size: number;
  creationDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  constructor(private http: HttpClient) {}

  getAllBackups(): Observable<BackupData[]> {
    return this.http.get<BackupData[]>('../../../../public/Backup.json');
  }
}
