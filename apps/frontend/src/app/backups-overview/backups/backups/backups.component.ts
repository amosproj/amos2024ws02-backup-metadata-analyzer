import { AfterViewInit, Component, OnInit } from '@angular/core';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
  BehaviorSubject,
  map,
  Observable,
  Subscription,
  switchMap,
} from 'rxjs';
import { BackupService } from '../../service/backup-service.service';
import { Backup } from '../../../shared/types/backup';
import { ClrDatagridStateInterface } from '@clr/angular';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-backups',
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css',
})
export class BackupsComponent implements AfterViewInit {
  selectedBackups: Backup[] = [];

  subscriptions: Subscription = new Subscription();
  readonly backupSubject$ = new BehaviorSubject<Backup[]>([]);
  backups$: Observable<Backup[]>;
  private filterOptions$ = new BehaviorSubject<any>({});

  constructor(private readonly backupService: BackupService) {
    this.filterOptions$
      .pipe(
        switchMap((filterOptions) =>
          this.backupService.getAllBackups(filterOptions)
        )
      )
      .subscribe((data) => {
        this.backupSubject$.next(data);
      });

    this.backups$ = this.backupSubject$.asObservable();
  }

  trackBackupById(backup: Backup): string {
    return backup.id;
  }

  ngAfterViewInit() {
    this.createChart();
  }

  refresh(option?: ClrDatagridStateInterface<Backup>): void {
    let params: HttpParams = new HttpParams();

    if (option) {
      if (option.page) {
        if (option.page.current && option.page.size)
          params = params.append(
            'offset',
            (option.page.current - 1) * option.page.size
          );
        if (option.page.size) params = params.append('limit', option.page.size);
      }

      if (option.sort) {
        params = params.set('orderBy', option.sort.by as string);
        params = params.set('sortOrder', option.sort.reverse ? 'DESC' : 'ASC');
      }
      if (option.filters) {
        option.filters.forEach((filter) => {
          params = params.append(filter.property, filter.value);
        });
      }
    }
    this.filterOptions$.next(params);
  }

  createChart() {
    let chartData$ = this.backups$.pipe(
      map((data) =>
        data.map((item) => ({
          date: new Date(item.creationDate),
          sizeMB: item.sizeMB,
        }))
      )
    );

    // Chart-Root erstellen
    let root = am5.Root.new('backupSizeChart');

    // Theme hinzufügen
    root.setThemes([am5themes_Animated.new(root)]);

    // Chart erstellen
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Size of last backups',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    // X-Achse
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: 'date',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    xAxis.get('renderer').labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
    });

    //xAxis.data.setAll(chartData);

    chartData$.subscribe((chartData) => xAxis.data.setAll(chartData));

    // Y-Achse
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Scrollbar hinzufügen
    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(root, {
        orientation: 'horizontal',
      })
    );

    // Balkenserie hinzufügen
    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Size',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'sizeMB',
        categoryXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{valueY} MB',
        }),
      })
    );

    //series.data.setAll(chartData);
    chartData$.subscribe((chartData) => series.data.setAll(chartData));

    // Animation für Balken
    series.appear(1000);
    chart.appear(1000, 100);
  }
}
