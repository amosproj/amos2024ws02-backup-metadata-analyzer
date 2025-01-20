import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

@ApiTags('Backup Alerts Overview')
@Controller('')
export class BackupAlertsOverviewController {
  private readonly logger = new Logger(BackupAlertsOverviewController.name);

  constructor(
    private readonly backupAlertsOverviewService: BackupAlertsOverviewService
  ) {}

  @Get('countBackupsByAlertClass')
  @ApiOperation({
    summary: 'Returns the count of backups grouped by alert class.',
  })
  @ApiOkResponse({
    description: 'The count of backups grouped by alert class.',
    type: BackupAlertsOverviewDto,
  })
  async getBackupCountsByAlertClass(): Promise<BackupAlertsOverviewDto> {
    this.logger.log('Fetching the count of backups grouped by alert class.');
    const result =
      await this.backupAlertsOverviewService.getBackupCountsByAlertClass();
    this.logger.log('Counts by alert class retrieved successfully.');
    return result;
  }
}
