import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { InformationServiceService } from './information-service.service';

describe('InformationService', () => {
  let service: InformationServiceService;
  let httpClientMock: {
    get: ReturnType<typeof vi.fn>;
  };
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(), // Add GET mock
    };

    service = new InformationServiceService(
      baseUrl,
      httpClientMock as unknown as HttpClient
    );
  });

  describe('getBasicInformation', () => {
    it('should fetch basic information', () => {
      const mockBasicInformation = {
        numberOfBackups: 10,
        totalBackupSize: 100,
      };
      httpClientMock.get.mockReturnValue(of(mockBasicInformation));

      service.getBasicInformations().subscribe((basicInformation) => {
        expect(basicInformation).toEqual(mockBasicInformation);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${baseUrl}/information`
        );
      });
    });
  });
});
