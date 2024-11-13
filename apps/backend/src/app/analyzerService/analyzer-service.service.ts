import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map, Observable } from 'rxjs';

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
  sendEcho(text: string): Observable<string> {
    this.logger.debug(`Sending echo request to Analyzer service`);
    return this.httpService
      .post<string>(`${this.analyzerServiceUrl}/echo`, {
        body: { text },
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Echo the given text.
   * @param text
   */
  async echo(text: string): Promise<string> {
    return await firstValueFrom(this.sendEcho(text));
  }

  /**
   * Gets the first entry of a dummy dataset in the database using the Analyzer service. (Used for Demo purposes)
   *
   * @returns The first entry.
   */
  getAnalyzerDemo(): Observable<string> {
    this.logger.debug(`Sending demo analyzer request to Analyzer service`);
    return this.httpService
      .get(`${this.analyzerServiceUrl}/analyze`)
      .pipe(map((response) => response.data));
  }

  /**
   * Return the "analyzed" data.
   */
  async analyzerDemo(): Promise<string> {
    return await firstValueFrom(this.getAnalyzerDemo());
  }
}
