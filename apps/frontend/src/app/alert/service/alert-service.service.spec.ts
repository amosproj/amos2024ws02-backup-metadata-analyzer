import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AlertServiceService } from './alert-service.service';
import { BASE_URL } from '../../shared/types/configuration';
import { Alert } from '../../shared/types/alert';
import { describe, it, expect, beforeEach } from 'vitest';
import { AlertType } from '../../shared/enums/alertType';

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
        id: '1',
        type: AlertType.SIZE_DECREASED,
        value: 100,
        referenceValue: 50,
        backup: { id: '1', sizeMB: 100, creationDate: new Date() },
      },
      {
        id: '2',
        type: AlertType.SIZE_INCREASED,
        value: 200,
        referenceValue: 100,
        backup: { id: '2', sizeMB: 200, creationDate: new Date() },
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
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: AlertType.SIZE_DECREASED,
        value: 100,
        referenceValue: 50,
        backup: { id: '1', sizeMB: 100, creationDate: new Date() },
      },
      {
        id: '2',
        type: AlertType.SIZE_INCREASED,
        value: 200,
        referenceValue: 100,
        backup: { id: '2', sizeMB: 200, creationDate: new Date() },
      },
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
