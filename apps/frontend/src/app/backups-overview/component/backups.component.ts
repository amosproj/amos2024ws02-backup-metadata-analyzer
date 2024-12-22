import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { BehaviorSubject } from 'rxjs';
import { BackupTask } from '../../shared/types/backup.task';

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit {
  protected filterPanel = false;

  @ViewChild(SidePanelComponent) sidePanelComponent!: SidePanelComponent;
  backupTaskSubject$: BehaviorSubject<BackupTask[]> | undefined;

  ngAfterViewInit(): void {
    this.backupTaskSubject$ = this.sidePanelComponent.backupTaskSubject$;
  }

  /**
   * Change the state of the filter panel to open or close it
   */
  protected changeFilterPanelState(): void {
    this.filterPanel = !this.filterPanel;
  }
}