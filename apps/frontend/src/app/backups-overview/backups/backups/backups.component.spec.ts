import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupsComponent } from './backups.component';
import { of } from 'rxjs';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import { Backup } from '../../../shared/types/backup';

describe('BackupsComponent', () => {
  let component: BackupsComponent;
  let fixture: ComponentFixture<BackupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
describe('BackupsComponent createChart', () => {
  let component: BackupsComponent;
  let fixture: ComponentFixture<BackupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create chart with correct data transformation', (done) => {
    const mockBackups: Backup[] = [
      { id: '12123-1323-1' ,creationDate: new Date(), sizeMB: 100, bio: 'test' },
      {id: '9876-432-2', creationDate: new Date(), sizeMB: 200 , bio: 'test2'}
    ];
    component.backups$ = of(mockBackups);

    spyOn(am5, 'Root').and.callThrough();
    spyOn(am5.Root.prototype, 'setThemes').and.callThrough();
    
    component.createChart();

    expect(am5.Root.new).toHaveBeenCalledWith('backupSizeChart');
    expect(component.root.setThemes).toHaveBeenCalled();
    done();
  });

  it('should configure chart axes correctly', () => {
    component.backups$ = of([]);
    component.createChart();
    const xAxis = component.chart.xAxes.values[0];
    const yAxis = component.chart.yAxes.values[0];

    expect(xAxis.get('categoryField')).toBe('date');
    expect(xAxis.get('maxDeviation')).toBe(0.3);
    expect(yAxis).toBeTruthy();
  });

  it('should handle empty backup data', () => {
    component.backups$ = of([]);
    
    spyOn(am5xy.XYChart.prototype, 'series').and.callThrough();
    component.createChart();

    expect(component.chart.series.values.length).toBe(1);
    expect(component.chart.series.values[0].get('valueYField')).toBe('sizeMB');
  });

  it('should configure series with correct fields', () => {
    component.backups$ = of([]);
    component.createChart();

    const series = component.chart.series.values[0];
    expect(series.get('valueYField')).toBe('sizeMB');
    expect(series.get('categoryXField')).toBe('date');
    expect(series.get('name')).toBe('Size');
  });

  it('should add scrollbar to chart', () => {
    component.backups$ = of([]);
    component.createChart();

    const scrollbar = component.chart.get('scrollbarX');
    expect(scrollbar).toBeTruthy();
    expect(scrollbar.get('orientation')).toBe('horizontal');
  });
});
