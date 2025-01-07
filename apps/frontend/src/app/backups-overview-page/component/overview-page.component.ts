import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { SidePanelComponent } from '../../shared/components/filter-side-panel/side-panel.component';
import { BehaviorSubject } from 'rxjs';
import { BackupTask } from '../../shared/types/backup.task';
import { ChartType } from '../../shared/enums/chartType';
import { ChartInformation } from '../../shared/types/chartInformation';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.css',
})
export class OverviewPageComponent implements AfterViewInit {
  @ViewChild(SidePanelComponent) sidePanelComponent!: SidePanelComponent;
  filterCount$: Observable<number> = of(0);

  readonly charts: ChartInformation[] = [
    {
      id: 'overviewSizeColumnChart',
      type: ChartType.SIZECOLUMNCHART,
    },
  ];

  protected isInfoPanelOpen = false;
  protected filterPanel = false;

  ngAfterViewInit(): void {
    this.filterCount$ = this.sidePanelComponent.filterCount$;
  }

  /**
   * Change the state of the filter panel to open or close it
   */
  protected changeFilterPanelState(): void {
    this.filterPanel = !this.filterPanel;
  }

  protected toggleInfoPanel() {
    this.isInfoPanelOpen = !this.isInfoPanelOpen;
  }
}
