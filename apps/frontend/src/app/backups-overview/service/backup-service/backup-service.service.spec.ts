import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { BackupService } from './backup-service.service';
import { BASE_URL } from '../../../shared/types/configuration';
import { APIResponse } from '../../../shared/types/api-response';
import { Backup } from '../../../shared/types/backup';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';

describe('BackupService', () => {
  let service: BackupService;
  let httpClientMock: {
    get: ReturnType<typeof vi.fn>;
  };
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
    };

    service = new BackupService(
      baseUrl,
      httpClientMock as unknown as HttpClient
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllBackups', () => {
    it('should filter out null and undefined params', () => {
      const mockFilterParams: BackupFilterParams = {
        offset: 0,
        limit: 10,
        fromDate: null,
        toDate: undefined,
      };

      const mockResponse: APIResponse<Backup> = {
        data: [],
        paginationData: {
          total: 0,
        },
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams).subscribe((response) => {
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${baseUrl}/backupData`,
          {
            params: expect.any(HttpParams),
          }
        );
        const passedParams = httpClientMock.get.mock.calls[0][1].params;
        expect(passedParams.keys()).toEqual(['offset', 'limit']);
      });
    });

    it('should call the correct endpoint with all valid params', () => {
      const mockFilterParams: BackupFilterParams = {
        limit: 10,
        offset: 0,
        orderBy: 'createdAt',
        sortOrder: 'DESC',
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
        fromSizeMB: 100,
        toSizeMB: 500,
      };

      const mockResponse: APIResponse<Backup> = {
        data: [],
        paginationData: {
          total: 0,
        },
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams).subscribe((response) => {
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${baseUrl}/backupData`,
          {
            params: expect.any(HttpParams),
          }
        );

        const passedParams = httpClientMock.get.mock.calls[0][1].params;
        expect(passedParams.get('limit')).toBe('10');
        expect(passedParams.get('offset')).toBe('0');
        expect(passedParams.get('orderBy')).toBe('createdAt');
        expect(passedParams.get('sortOrder')).toBe('DESC');
        expect(passedParams.get('fromDate')).toBe('2023-01-01');
        expect(passedParams.get('toDate')).toBe('2023-12-31');
        expect(passedParams.get('fromSizeMB')).toBe('100');
        expect(passedParams.get('toSizeMB')).toBe('500');
      });
    });

    it('should use shareReplay to cache the response', () => {
      const mockFilterParams: BackupFilterParams = {
        offset: 10,
        limit: 10,
      };

      const mockResponse: APIResponse<Backup> = {
        data: [],
        paginationData: {
          total: 0,
        },
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      const observable = service.getAllBackups(mockFilterParams);

      observable.subscribe();
      observable.subscribe();

      expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty filter params', () => {
      const mockFilterParams: BackupFilterParams = {};

      const mockResponse: APIResponse<Backup> = {
        data: [],
        paginationData: {
          total: 0,
        },
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams).subscribe((response) => {
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${baseUrl}/backupData`,
          {
            params: expect.any(HttpParams),
          }
        );

        const passedParams = httpClientMock.get.mock.calls[0][1].params;
        expect(passedParams.keys().length).toBe(0);
      });
    });
  });
});
