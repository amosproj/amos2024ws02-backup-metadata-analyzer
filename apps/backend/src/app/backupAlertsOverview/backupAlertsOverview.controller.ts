import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';

@ApiTags('BackupAlertsOverview')
@Controller('backupAlertsOverview')
export class BackupAlertsOverviewController {
  private readonly logger = new Logger(BackupAlertsOverviewController.name);

  constructor(
    private readonly backupAlertsOverviewService: BackupAlertsOverviewService
  ) {}

  @Get('count-backups')
  @ApiOperation({
    summary: 'Returns the total number of backups.',
  })
  @ApiOkResponse({
    description: 'Total number of backups returned.',
    type: Number,
  })
  async getBackupCount(): Promise<number> {
    this.logger.log('Fetching the total number of backups.');
    const count = await this.backupAlertsOverviewService.getBackupCount();
    this.logger.log(`Total backups: ${count}`);
    return count;
  }

  @Get('count-size-alerts-with-severity')
  @ApiOperation({
    summary:
      'Returns the count of backups with Size alerts along with their severity.',
  })
  @ApiOkResponse({
    description:
      'Count of backups with Size alerts and their severity returned.',
    type: Object,
  })
  async getSizeAlertCountWithSeverity(): Promise<{
    count: number;
    severity: string;
  }> {
    this.logger.log(
      'Fetching the count of backups with Size alerts and their severity.'
    );
    const result =
      await this.backupAlertsOverviewService.getSizeAlertCountWithSeverity();
    this.logger.log(
      `Backups with Size alerts: ${result.count}, Severity: ${result.severity}`
    );
    return result;
  }

  @Get('count-creation-date-alerts-with-severity')
  @ApiOperation({
    summary:
      'Returns the count of backups with CreationDate alerts along with their severity.',
  })
  @ApiOkResponse({
    description:
      'Count of backups with CreationDate alerts and their severity returned.',
    type: Object,
  })
  async getCreationDateAlertCountWithSeverity(): Promise<{
    count: number;
    severity: string;
  }> {
    this.logger.log(
      'Fetching the count of backups with CreationDate alerts and their severity.'
    );
    const result =
      await this.backupAlertsOverviewService.getCreationDateAlertCountWithSeverity();
    this.logger.log(
      `Backups with CreationDate alerts: ${result.count}, Severity: ${result.severity}`
    );
    return result;
  }

  @Get('count-backups-without-alerts')
  @ApiOperation({
    summary: 'Returns the count of backups without any alerts.',
  })
  @ApiOkResponse({
    description: 'Count of backups without any alerts returned.',
    type: Number,
  })
  async getBackupsWithoutAlertsCount(): Promise<number> {
    this.logger.log('Fetching the count of backups without any alerts.');
    const count =
      await this.backupAlertsOverviewService.getBackupWithoutAlertsCount();
    this.logger.log(`Backups without alerts: ${count}`);
    return count;
  }
}
