import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AlertServiceService } from './alert-service.service';
import { BASE_URL } from '../../types/configuration';
import { Alert } from '../../types/alert';
import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SeverityType } from '../../enums/severityType';
import { BackupType } from '../../enums/backup.types';

describe('AlertServiceService', () => {
  let service: AlertServiceService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AlertServiceService,
        { provide: BASE_URL, useValue: baseUrl },
      ],
    });

    service = TestBed.inject(AlertServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all alerts without days parameter', () => {
    const mockAlerts: Alert[] = [
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 0,
          creationDate: new Date(),
          saveset: '',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
      },
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 10,
          creationDate: new Date(),
          saveset: '',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
      },
    ];

    service.getAllAlerts().subscribe((alerts) => {
      expect(alerts).toEqual(mockAlerts);
    });

    const req = httpMock.expectOne(`${baseUrl}/alerting`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAlerts);
  });

  it('should fetch alerts with days parameter', () => {
    const mockAlerts = [
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'test',
          severity: SeverityType.INFO,
          user_active: true,
          master_active: true,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 0,
          creationDate: new Date(),
          saveset: '',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
      },
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(),
          name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false,
        },
        backup: {
          id: randomUUID().toString(),
          sizeMB: 10,
          creationDate: new Date(),
          saveset: '',
          type: BackupType.DIFFERENTIAL,
        },
        creationDate: new Date(),
      },
    ];
    const days = 7;
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    service.getAllAlerts(fromDate).subscribe((alerts) => {
      expect(alerts).toEqual(mockAlerts);
    });

    const req = httpMock.expectOne(`${baseUrl}/alerting?offset=0&limit=10&fromDate=${fromDate}`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockAlerts, paginationInfo: {} });
  });
});
