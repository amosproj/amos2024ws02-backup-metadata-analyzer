import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AnalyzerService } from './analyzer-service';

describe('AnalyzerService', () => {
  let service: AnalyzerService;
  let httpClientMock: {
    post: ReturnType<typeof vi.fn>;
  };
  const baseUrl = 'http://test-url';

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
    };

    service = new AnalyzerService(
      baseUrl,
      httpClientMock as unknown as HttpClient
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
      });
    });
  });
});
