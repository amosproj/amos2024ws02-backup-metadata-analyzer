import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AnalyzerService } from './analyzer-service';
import { AlertServiceService } from '../alert-service/alert-service.service';
import { BackupService } from '../backup-service/backup-service.service';
import { DataStoresService } from '../data-stores-service/data-stores-service.service';
import { InformationServiceService } from '../information-service/information-service.service';

describe('AnalyzerService', () => {
  let service: AnalyzerService;
  let httpClientMock: {
    post: ReturnType<typeof vi.fn>;
  };
  let alertServiceMock: {
    refresh: ReturnType<typeof vi.fn>;
  };
  let dataStoresServiceMock: {
    refresh: ReturnType<typeof vi.fn>;
  };
  let backupServiceMock: {
    refresh: ReturnType<typeof vi.fn>;
  };
  let informationServiceMock: {
    refresh: ReturnType<typeof vi.fn>;
  };
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
    };
    httpClientMock = {
      post: vi.fn(),
    };
    alertServiceMock = {
      refresh: vi.fn(),
    };
    dataStoresServiceMock = {
      refresh: vi.fn(),
    };
    backupServiceMock = {
      refresh: vi.fn(),
    };
    informationServiceMock = {
      refresh: vi.fn(),
    };

    service = new AnalyzerService(
      baseUrl,
      httpClientMock as unknown as HttpClient,
      alertServiceMock as unknown as AlertServiceService,
      dataStoresServiceMock as unknown as DataStoresService,
      backupServiceMock as unknown as BackupService,
      informationServiceMock as unknown as InformationServiceService
    );
  });

  describe('refresh', () => {
    it('should call refresh endpoint', () => {
      httpClientMock.post.mockReturnValue(of({}));

      service.refresh().subscribe(() => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          `${baseUrl}/analyzer/refresh`,
          {}
        );

        expect(alertServiceMock.refresh).toHaveBeenCalled();
        expect(dataStoresServiceMock.refresh).toHaveBeenCalled();
        expect(backupServiceMock.refresh).toHaveBeenCalled();
        expect(informationServiceMock.refresh).toHaveBeenCalled();
      });
    });
  });
});
