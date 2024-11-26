import { TestBed } from '@angular/core/testing';
import { BASE_URL } from '../../shared/types/configuration';
import { TestUploadServiceService } from './test-upload-service.service';
import { HttpClient } from '@angular/common/http';

describe('TestUploadServiceService', () => {
  let service: TestUploadServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({     
      providers: [
      {provide: BASE_URL, useValue: TestUploadServiceService},
      {provide: HttpClient, useValue: TestUploadServiceService},
      TestUploadServiceService
    ]});
    service = TestBed.inject(TestUploadServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
