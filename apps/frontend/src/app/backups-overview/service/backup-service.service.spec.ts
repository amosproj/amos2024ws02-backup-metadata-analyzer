import { TestBed } from '@angular/core/testing';
import { BackupService } from './backup-service.service';
import { HttpClient, HttpParams } from '@angular/common/http';

describe('BackupService', () => {
  let service: BackupService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BackupService,
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
    service = TestBed.inject(BackupService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should inject HttpClient', () => {
    expect(httpClient).toBeTruthy();
  });

  it('should handle HttpParams creation', () => {
    const params = new HttpParams()
      .set('test', 'value')
      .set('another', 'param');
    expect(params.get('test')).toBe('value');
    expect(params.get('another')).toBe('param');
  });

  it('should handle empty HttpParams', () => {
    const params = new HttpParams();
    expect(params.toString()).toBe('');
  });

  it('should handle multiple values in HttpParams', () => {
    const params = new HttpParams()
      .append('key', 'value1')
      .append('key', 'value2');
    expect(params.getAll('key')).toEqual(['value1', 'value2']);
  });
});
