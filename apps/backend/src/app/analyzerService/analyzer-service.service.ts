import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';

/**
 * Service to connect to the Analyzer service.
 */
@Injectable()
export class AnalyzerServiceService {
  readonly logger = new Logger(AnalyzerServiceService.name);
  readonly analyzerServiceUrl: string =
    this.configService.getOrThrow('ANALYZER_URL');

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  /**
   * Sends an echo request to the Analyzer service. (Used for Demo purposes)
   *
   * @param text The text to echo.
   * @returns The echoed text.
   */
  echo(text: string): Observable<string> {
    this.logger.debug(`Sending echo request to Analyzer service`);
    return this.httpService
      .post<string>(`${this.analyzerServiceUrl}/echo`, {
        body: { text },
      })
      .pipe(map((response) => response.data));
  }
}
