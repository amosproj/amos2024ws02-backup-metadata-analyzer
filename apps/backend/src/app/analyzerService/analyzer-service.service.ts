import { Injectable, Logger } from '@nestjs/common';
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
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  /**
   * Trigger all analyzers.
   */
  async triggerAll(): Promise<void> {
    this.logger.debug(`Triggering all analyzers`);
    await this.updateBasicBackupData();
    await Promise.all([
      this.triggerSizeAnalysisForFullBackups(),
      this.triggerSizeAnalysisForDiffBackups(),
      this.triggerSizeAnalysisForIncBackups(),
      this.triggerCreationDateAnalysis(),
      this.triggerStorageFillAnalysis(),
    ]);
  }

  async updateBasicBackupData(): Promise<void> {
    await firstValueFrom(
      this.httpService.post(`${this.analyzerServiceUrl}/updateBasicBackupData`)
    ).then(() => {
      this.logger.log(`Basic Backup Data updated`);
    });
  }

  /**
   * Trigger the storage fill analysis.
   */
  async triggerStorageFillAnalysis() {
    await firstValueFrom(
      this.httpService.post(
        `${this.analyzerServiceUrl}/simpleRuleBasedAnalysisStorageCapacity?alertLimit=-1`
      )
    )
      .then((response) => {
        this.logger.log(
          `Storage Fill Analysis done. Triggered ${response.data.count} Alerts`
        );
      })
      .catch((error) => {
        this.logger.error(`Error on Storage Fill Analysis: ${error}`);
      });
  }

  /**
   * Trigger the creationDateAnalysis
   */
  async triggerCreationDateAnalysis() {
    await firstValueFrom(
      this.httpService.post(
        `${this.analyzerServiceUrl}/simpleRuleBasedAnalysisCreationDates?alertLimit=-1`
      )
    )
      .then((response) => {
        this.logger.log(
          `Creation Date Analysis done. Triggered ${response.data.count} Alerts`
        );
      })
      .catch((error) => {
        this.logger.error(`Error on Creation Date Analysis: ${error}`);
      });
  }

  /**
   * Trigger the size analysis for full backups.
   */
  async triggerSizeAnalysisForFullBackups() {
    await firstValueFrom(
      this.httpService.post(
        `${this.analyzerServiceUrl}/simpleRuleBasedAnalysis?alertLimit=-1`
      )
    )
      .then((response) => {
        this.logger.log(
          `Size Analysis done for full backups. Triggered ${response.data.count} Alerts`
        );
      })
      .catch((error) => {
        this.logger.error(`Error on Size Analysis for full backups: ${error}`);
      });
  }

  /**
   * Trigger the size analysis for diff backups.
   */
  async triggerSizeAnalysisForDiffBackups() {
    await firstValueFrom(
      this.httpService.post(
        `${this.analyzerServiceUrl}/simpleRuleBasedAnalysisDiff?alertLimit=-1`
      )
    )
      .then((response) => {
        this.logger.log(
          `Size Analysis done for diff backups. Triggered ${response.data.count} Alerts`
        );
      })
      .catch((error) => {
        this.logger.error(`Error on Size Analysis for diff backups: ${error}`);
      });
  }

  /**
   * Trigger the size analysis for inc backups.
   */
  async triggerSizeAnalysisForIncBackups() {
    await firstValueFrom(
      this.httpService.post(
        `${this.analyzerServiceUrl}/simpleRuleBasedAnalysisInc?alertLimit=-1`
      )
    )
      .then((response) => {
        this.logger.log(
          `Size Analysis done for inc backups. Triggered ${response.data.count} Alerts`
        );
      })
      .catch((error) => {
        this.logger.error(`Error on Size Analysis for inc backups: ${error}`);
      });
  }

  //DEMOS
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
