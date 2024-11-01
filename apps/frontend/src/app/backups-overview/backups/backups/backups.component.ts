import { Component } from '@angular/core';
//import backups from 'Backups.json';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5radar from '@amcharts/amcharts5/radar';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { BackupService } from '../../service/backup-service.service';

interface BackupData {
  id: string;
  size: number;
  creationDate: Date;
}
@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent {
  selectedBackups: BackupData[] = [];
  readonly backups$: Observable<BackupData[]>;
  constructor(private readonly backupService: BackupService) {
    //Um die Backup-Anzahl mittels Pagination zu kontrollieren, muss hier gesetzt werden, welche Elemente geladen werden sollen ( von n bis n+20 bsp.)
    this.backups$ = this.backupService.getAllBackups().pipe();
  }

  trackBackupById(backup: BackupData): string {
    return backup.id;
  }
}
