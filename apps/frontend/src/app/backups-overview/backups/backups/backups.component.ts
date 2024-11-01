import {
  AfterViewInit,
  Component,
  Inject,
  NgZone,
  PLATFORM_ID,
} from '@angular/core';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5radar from '@amcharts/amcharts5/radar';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit {

  constructor() {}

  ngAfterViewInit() {
    // Chart code goes in here
    // let chart = am5.Root.new('heatmapChart');
    let root = am5.Root.new('heatmapChart');
    let chart = root.container.children.push(am5radar.RadarChart.new(root, {}));

    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        renderer: am5radar.AxisRendererCircular.new(root, {}),
        baseInterval: {
          timeUnit: 'month',
          count: 1,
        },
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5radar.AxisRendererRadial.new(root, {}),
      })
    );

    let series = chart.series.push(
      am5radar.RadarColumnSeries.new(root, {
        name: 'Series',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'value',
        valueXField: 'date',
      })
    );

    let data = [
      {
        category: 'Backup-2024-10',
        value1: 1000,
        value2: 588,
      },
      {
        category: 'Backup-2024-09',
        value1: 1200,
        value2: 1800,
      },
      {
        category: 'Backup-2024-08',
        value1: 850,
        value2: 1230,
      },
    ];
    series.data.setAll(data);
    //series2.data.setAll(data);

    let legend = chart.children.push(am5.Legend.new(root, {}));
    legend.data.setAll(chart.series.values);
    chart.set('cursor', am5radar.RadarCursor.new(root, {}));
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    /*     this.browserOnly(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
 */
  }
}
