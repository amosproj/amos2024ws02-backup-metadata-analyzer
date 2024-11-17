

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import { Backup } from '../../../shared/types/backup';
import { BackupService } from '../../service/backup-service.service';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackupsComponent } from './backups.component';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('BackupsComponent', () => {
  let component: BackupsComponent;
  let fixture: ComponentFixture<BackupsComponent>;
  let backupService: BackupService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackupsComponent],
      providers: [
        {
          provide: BackupService,
          useValue: {
            getBackups: () => of([]),
            deleteBackup: () => of({}),
            createBackup: () => of({})
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BackupsComponent);
    component = fixture.componentInstance;
    backupService = TestBed.inject(BackupService);
  });

  it('should initialize chart on ngAfterViewInit', fakeAsync(() => {
    spyOn(am5, 'Root').and.returnValue({ container: { children: { push: () => {} } } });
    component.ngAfterViewInit();
    tick();
    expect(component.root).toBeDefined();
  }));

});
