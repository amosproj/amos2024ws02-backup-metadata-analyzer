import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

@ApiTags('Alerting')
@Controller('alerting')
export class BackupAlertsOverviewController {
  private readonly logger = new Logger(BackupAlertsOverviewController.name);

  constructor(
    private readonly backupAlertsOverviewService: BackupAlertsOverviewService
  ) {}

  @Get('severityOverview')
  @ApiOperation({
    summary: 'Returns the count of backup alerts grouped by severity.',
  })
  @ApiOkResponse({
    description: 'The count of backup alerts grouped by severity.',
    type: BackupAlertsOverviewDto,
  })
  async getBackupAlertsBySeverity(): Promise<BackupAlertsOverviewDto> {
    this.logger.log('Fetching the count of backup alerts grouped by severity.');
    const result =
      await this.backupAlertsOverviewService.getBackupAlertsBySeverity();
    this.logger.log('Counts by severity retrieved successfully.');
    return result;
  }
}
