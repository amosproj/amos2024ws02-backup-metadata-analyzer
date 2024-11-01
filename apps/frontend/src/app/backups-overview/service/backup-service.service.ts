import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

interface BackupData {
  id: string;
  sizeMB: number;
  creationDate: Date;
  bio: string;
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
