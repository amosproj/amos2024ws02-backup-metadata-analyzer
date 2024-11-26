import { TestBed } from '@angular/core/testing';
import { BASE_URL } from '../../shared/types/configuration';
import { BackupService } from './backup-service.service';
import { BackupsComponent } from '../backups/backups/backups.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApplicationModule } from '@angular/core';

describe('BackupServiceService', () => {
  let service: BackupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackupsComponent],
      imports: [HttpClientTestingModule, ApplicationModule],
      providers: [
        {provide: BASE_URL, useValue: BackupService},
        BackupService
      ]
    });
    service = TestBed.inject(BackupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
