import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AlertServiceService } from './alert-service.service';
import { BASE_URL } from '../../shared/types/configuration';
import { Alert } from '../../shared/types/alert';
import { describe, it, expect, beforeEach } from 'vitest';
import { AlertType } from '../../shared/types/alertType';
import { BackupService } from '../../backups-overview/service/backup-service/backup-service.service';
import { randomUUID } from 'node:crypto';
import { SeverityType } from '../../shared/enums/severityType';

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
          id: randomUUID().toString(), name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false
        },
        backup: { id: randomUUID().toString(), sizeMB: 0, creationDate: new Date() },
      },
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(), name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false
        },
        backup: { id: randomUUID().toString(), sizeMB: 10, creationDate: new Date() },
      }
    ];

    service.getAllAlerts().subscribe((alerts) => {
      expect(alerts).toEqual(mockAlerts);
    });

    const req = httpMock.expectOne(`${baseUrl}/alerting`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAlerts);
  });

  it('should fetch alerts with days parameter', () => {
    const mockAlerts: Alert[] = [
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(), name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false
        },
        backup: { id: randomUUID().toString(), sizeMB: 0, creationDate: new Date() },
      },
      {
        id: randomUUID().toString(),
        alertType: {
          id: randomUUID().toString(), name: 'test',
          severity: SeverityType.INFO,
          user_active: false,
          master_active: false
        },
        backup: { id: randomUUID().toString(), sizeMB: 10, creationDate: new Date() },
      }
    ];
    const days = 7;

    service.getAllAlerts(days).subscribe((alerts) => {
      expect(alerts).toEqual(mockAlerts);
    });

    const req = httpMock.expectOne(`${baseUrl}/alerting?days=${days}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAlerts);
  });
});
