import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { ChartType } from '../../shared/enums/chartType';
import { ChartInformation } from '../../shared/types/chartInformation';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit {
  @ViewChild(SidePanelComponent) sidePanelComponent!: SidePanelComponent;
  filterCount$: Observable<number> = of(0);

  readonly charts: ChartInformation[] = [
    {
      id: 'overviewSizePieChart',
      type: ChartType.SIZEPIECHART,
    },
    {
      id: 'overviewSizeColumnChart',
      type: ChartType.SIZECOLUMNCHART,
    },
  ];

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
}
