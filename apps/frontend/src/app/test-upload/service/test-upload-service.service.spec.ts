import { TestBed } from '@angular/core/testing';

import { TestUploadService } from './test-upload-service.service';
import { HttpClient } from '@angular/common/http';

describe('TestUploadService', () => {
  let service: TestUploadService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestUploadService,
        {
          provide: HttpClient,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    });
    service = TestBed.inject(TestUploadService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should inject HttpClient', () => {
    expect(httpClient).toBeTruthy();
  });

  it('should have HttpClient available as a dependency', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });

  it('should have working HttpClient mock', () => {
    const spy = jest.spyOn(httpClient, 'get');
    httpClient.get('/test');
    expect(spy).toHaveBeenCalledWith('/test');
  });
});
