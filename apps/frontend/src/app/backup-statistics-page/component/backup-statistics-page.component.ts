import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ChartInformation } from '../../shared/types/chartInformation';
import { ChartType } from '../../shared/enums/chartType';
import { SidePanelComponent } from '../../shared/components/filter-side-panel/side-panel.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-backup-statistics-page',
  templateUrl: './backup-statistics-page.component.html',
  styleUrl: './backup-statistics-page.component.css',
})
export class BackupStatisticsPageComponent implements AfterViewInit {
  @ViewChild(SidePanelComponent) sidePanelComponent!: SidePanelComponent;
  filterCount$: Observable<number> = of(0);
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
    this.filterCount$ = this.sidePanelComponent.filterCount$;
  }

  /**
   * Change the state of the filter panel to open or close it
   */
  protected changeFilterPanelState(): void {
    this.filterPanel = !this.filterPanel;
  }
}
