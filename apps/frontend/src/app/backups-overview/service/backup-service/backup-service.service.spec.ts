import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { BackupService } from './backup-service.service';
import { APIResponse } from '../../../shared/types/api-response';
import { Backup } from '../../../shared/types/backup';
import { BackupFilterParams } from '../../../shared/types/backup-filter-type';
import { fail } from 'assert';

describe('BackupService', () => {
  let service: BackupService;
  let httpClientMock: {
    post: ReturnType<typeof vi.fn>;
  };
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
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

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams).subscribe((response) => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          `${baseUrl}/backupData/filter`,
          null,
          {
            params: expect.any(HttpParams),
          }
        );
        const passedParams = httpClientMock.post.mock.calls[0][2].params;
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

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams).subscribe((response) => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          `${baseUrl}/backupData/filter`,
          null,
          {
            params: expect.any(HttpParams),
          }
        );

        const passedParams = httpClientMock.post.mock.calls[0][2].params;
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

      httpClientMock.post.mockReturnValue(of(mockResponse));

      const observable = service.getAllBackups(mockFilterParams);

      observable.subscribe();
      observable.subscribe();

      expect(httpClientMock.post).toHaveBeenCalledTimes(1);
    });

    it('should handle empty filter params', () => {
      const mockFilterParams: BackupFilterParams = {};

      const mockResponse: APIResponse<Backup> = {
        data: [],
        paginationData: {
          total: 0,
        },
      };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams).subscribe((response) => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          `${baseUrl}/backupData/filter`,
          null,
          {
            params: expect.any(HttpParams),
          }
        );

        const passedParams = httpClientMock.post.mock.calls[0][2].params;
        expect(passedParams.keys().length).toBe(0);
      });
    });

    it('should propagate HTTP errors', () => {
      const mockFilterParams: BackupFilterParams = {
        offset: 0,
        limit: 10,
      };

      const mockError = new Error('Network error');

      httpClientMock.post.mockReturnValue(throwError(() => mockError));
      service.getAllBackups(mockFilterParams).subscribe({
        next: () => fail('expected an error, not backups'),
        error: (error) => expect(error).toBe(mockError),
      });
    });
  });
});
