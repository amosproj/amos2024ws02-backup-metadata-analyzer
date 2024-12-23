import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { BackupService } from './backup-service.service';
import { APIResponse } from '../../types/api-response';
import { Backup } from '../../types/backup';
import { BackupFilterParams } from '../../types/backup-filter-type';
import { BackupTask } from '../../types/backup.task';
import { fail } from 'assert';

describe('BackupService', () => {
  let service: BackupService;
  let httpClientMock: {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
      get: vi.fn(), // Add GET mock
    };

    service = new BackupService(
      baseUrl,
      httpClientMock as unknown as HttpClient
    );
  });

  // ... existing tests ...

  describe('getAllBackupTasks', () => {
    it('should fetch all backup tasks', () => {
      const mockTasks: BackupTask[] = [
        { id: '1', displayName: 'Task 1' },
        { id: '2', displayName: 'Task 2' },
      ];

      httpClientMock.get.mockReturnValue(of(mockTasks));

      service.getAllBackupTasks().subscribe((tasks) => {
        expect(tasks).toEqual(mockTasks);
        expect(httpClientMock.get).toHaveBeenCalledWith(`${baseUrl}/tasks`);
      });
    });

    it('should handle empty tasks response', () => {
      const mockTasks: BackupTask[] = [];

      httpClientMock.get.mockReturnValue(of(mockTasks));

      service.getAllBackupTasks().subscribe((tasks) => {
        expect(tasks).toEqual([]);
        expect(httpClientMock.get).toHaveBeenCalledWith(`${baseUrl}/tasks`);
      });
    });

    it('should propagate HTTP errors for tasks endpoint', () => {
      const mockError = new Error('Network error');

      httpClientMock.get.mockReturnValue(throwError(() => mockError));

      service.getAllBackupTasks().subscribe({
        next: () => fail('expected an error, not tasks'),
        error: (error) => expect(error).toBe(mockError),
      });
    });
  });

  describe('getAllBackups with taskIds', () => {
    it('should include taskIds in request body when provided', () => {
      const mockFilterParams: BackupFilterParams = {
        limit: 10,
        offset: 0,
      };
      const selectedTasks = ['task1', 'task2'];

      const mockResponse: APIResponse<Backup> = {
        data: [],
        paginationData: {
          total: 0,
        },
      };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams, selectedTasks).subscribe(() => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          `${baseUrl}/backupData/filter`,
          { taskIds: selectedTasks },
          {
            params: expect.any(HttpParams),
          }
        );
      });
    });

    it('should handle null taskIds in request', () => {
      const mockFilterParams: BackupFilterParams = {
        limit: 10,
        offset: 0,
      };

      const mockResponse: APIResponse<Backup> = {
        data: [],
        paginationData: {
          total: 0,
        },
      };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getAllBackups(mockFilterParams).subscribe(() => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          `${baseUrl}/backupData/filter`,
          { taskIds: undefined },
          {
            params: expect.any(HttpParams),
          }
        );
      });
    });
  });
});
