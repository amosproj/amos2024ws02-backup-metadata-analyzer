import { TestBed } from '@angular/core/testing';

import { BackupServiceService } from './backup-service.service';

describe('BackupServiceService', () => {
  let service: BackupServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackupServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
