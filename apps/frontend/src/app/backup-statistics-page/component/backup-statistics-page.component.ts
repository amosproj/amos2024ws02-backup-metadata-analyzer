import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChartInformation } from '../../shared/types/chartInformation';
import { ChartType } from '../../shared/enums/chartType';
import { SidePanelComponent } from '../../shared/components/filter-side-panel/side-panel.component';
import { BehaviorSubject } from 'rxjs';
import { BackupTask } from '../../shared/types/backup.task';

@Component({
  selector: 'app-backup-statistics-page',
  templateUrl: './backup-statistics-page.component.html',
  styleUrl: './backup-statistics-page.component.css',
})
export class BackupStatisticsPageComponent implements AfterViewInit {
  @ViewChild(SidePanelComponent) sidePanelComponent!: SidePanelComponent;
  backupTaskSubject$: BehaviorSubject<BackupTask[]> | undefined;
  protected filterPanel = false;

  readonly charts: ChartInformation[] = [
    {
      id: 'backupStatisticsPageSizePieChart',
      type: ChartType.SIZEPIECHART,
    },
    {
      id: 'backupStatisticsPageSizeColumnChart',
      type: ChartType.SIZECOLUMNCHART,
    },
  ];

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
