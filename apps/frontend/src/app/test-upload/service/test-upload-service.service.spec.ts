import { TestBed } from '@angular/core/testing';

import { TestUploadServiceService } from './test-upload-service.service';

describe('TestUploadServiceService', () => {
  let service: TestUploadServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestUploadServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
