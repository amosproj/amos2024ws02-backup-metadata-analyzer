import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { fail } from 'assert';
import { DataStoresService } from './data-stores-service.service';
import { DataStore } from '../../types/data-store';

describe('BackupService', () => {
  let service: DataStoresService;
  let httpClientMock: {
    get: ReturnType<typeof vi.fn>;
  };
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(), // Add GET mock
    };

    service = new DataStoresService(
      baseUrl,
      httpClientMock as unknown as HttpClient
    );
  });

  // ... existing tests ...

  describe('getAllDataStores', () => {
    it('should fetch all data stores', () => {
      const mockDataStores: DataStore[] = [
        {
          id: '1',
          displayName: 'Data Store 1',
          capacity: 100,
          filled: 20,
          highWaterMark: 80,
        },
        {
          id: '2',
          displayName: 'Data Store 2',
          capacity: 200,
          filled: 40,
          highWaterMark: 160,
        },
      ];

      httpClientMock.get.mockReturnValue(of(mockDataStores));

      service.getAllDataStores().subscribe((dataStores) => {
        expect(dataStores).toEqual(mockDataStores);
        expect(httpClientMock.get).toHaveBeenCalledWith(`${baseUrl}/dataStores`);
      });
    });

    it('should handle empty data stores response', () => {
      const mockDataStores: DataStore[] = [];

      httpClientMock.get.mockReturnValue(of(mockDataStores));

      service.getAllDataStores().subscribe((dataStores) => {
        expect(dataStores).toEqual([]);
        expect(httpClientMock.get).toHaveBeenCalledWith(`${baseUrl}/dataStores`);
      });
    });

    it('should propagate HTTP errors for data stores endpoint', () => {
      const mockError = new Error('Network error');

      httpClientMock.get.mockReturnValue(throwError(() => mockError));

      service.getAllDataStores().subscribe({
        next: () => fail('expected an error, not data stores'),
        error: (error) => expect(error).toBe(mockError),
      });
    });
  });
});
