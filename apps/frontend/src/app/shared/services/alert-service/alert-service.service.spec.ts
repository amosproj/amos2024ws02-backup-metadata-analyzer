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
import { AlertFilterParams } from '../../types/alert-filter-type';

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

    const filterParams: AlertFilterParams = {};

    service.getAllAlerts(filterParams).subscribe((alerts) => {
      expect(alerts).toEqual({
        data: mockAlerts,
        paginationData: { total: 2 },
      });
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${baseUrl}/alerting` &&
        request.method === 'GET' &&
        request.params.get('offset') === '0' &&
        request.params.get('limit') === '10'
      );
    });
    req.flush({ data: mockAlerts, paginationData: { total: 2 } });
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
    const fromDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();
    const filterParams: AlertFilterParams = {
      fromDate,
    };

    service.getAllAlerts(filterParams).subscribe((alerts) => {
      expect(alerts).toEqual({
        data: mockAlerts,
        paginationData: { total: 2 },
      });
    });

    // Use request matcher function instead of exact URL string
    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${baseUrl}/alerting` &&
        request.method === 'GET' &&
        request.params.has('fromDate') &&
        request.params.get('fromDate') === fromDate &&
        request.params.get('offset') === '0' &&
        request.params.get('limit') === '10'
      );
    });

    req.flush({ data: mockAlerts, paginationData: { total: 2 } });
  });

  it('should fetch alert counts without fromDate parameter', () => {
    const mockAlertCounts = {
      total: 5,
      critical: 1,
      warning: 2,
      info: 2,
    };

    service.getAlertCounts().subscribe((alertCounts) => {
      expect(alertCounts).toEqual(mockAlertCounts);
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${baseUrl}/alerting/statistics` &&
        request.method === 'GET' &&
        !request.params.has('fromDate')
      );
    });
    req.flush(mockAlertCounts);
  });

  it('should fetch alert counts with fromDate parameter', () => {
    const mockAlertCounts = {
      total: 3,
      critical: 1,
      warning: 1,
      info: 1,
    };
    const fromDate = new Date().toISOString();

    service.getAlertCounts(fromDate).subscribe((alertCounts) => {
      expect(alertCounts).toEqual(mockAlertCounts);
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${baseUrl}/alerting/statistics` &&
        request.method === 'GET' &&
        request.params.has('fromDate') &&
        request.params.get('fromDate') === fromDate
      );
    });
    req.flush(mockAlertCounts);
  });
});
