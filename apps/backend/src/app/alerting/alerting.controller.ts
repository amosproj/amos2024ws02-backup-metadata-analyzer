import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery, ApiTags
} from '@nestjs/swagger';
import { AlertingService } from './alerting.service';
import { CreateAlertTypeDto } from './dto/createAlertType.dto';
import { AlertTypeEntity } from './entity/alertType.entity';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';
import { Alert } from './entity/alerts/alert';
import { BackupType } from '../backupData/dto/backupType';
import { AlertStatusDto } from './dto/alertStatus.dto';

@ApiTags('Alerting')
@Controller('alerting')
export class AlertingController {
  readonly logger = new Logger(AlertingController.name);

  constructor(private readonly alertingService: AlertingService) {}

  @Post('type')
  @ApiOperation({ summary: 'Create a new alert type.' })
  @ApiConflictResponse({ description: 'Alert type already exists' })
  @ApiBody({ type: CreateAlertTypeDto })
  async createAlertType(@Body() createAlertTypeDto: CreateAlertTypeDto) {
    await this.alertingService.createAlertType(createAlertTypeDto);
  }

  @Patch('type/:alertTypeId/user')
  @ApiOperation({ summary: 'Activate Alert Type by user.' })
  @ApiNotFoundResponse({ description: 'Alert type not found' })
  @ApiBody({ type: AlertStatusDto })
  async userChangeActiveStatusAlertType(
    @Param('alertTypeId') alertTypeId: string,
    @Body() alertStatusDto: AlertStatusDto
  ) {
    await this.alertingService.userChangeActiveStatusAlertType(
      alertTypeId,
      alertStatusDto.status
    );
  }

  @Patch('type/:alertTypeId/admin')
  @ApiOperation({ summary: 'Activate Alert Type by admin.' })
  @ApiNotFoundResponse({ description: 'Alert type not found' })
  @ApiBody({ type: AlertStatusDto })
  async adminChangeActiveStatusAlertType(
    @Param('alertTypeId') alertTypeId: string,
    @Body() alertStatusDto: AlertStatusDto
  ) {
    await this.alertingService.adminChangeActiveStatusAlertType(
      alertTypeId,
      alertStatusDto.status
    );
  }

  @Get('type')
  @ApiOperation({ summary: 'Get all alert types.' })
  @ApiQuery({
    name: 'user_active',
    description: 'Filter alert types by user active',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'master_active',
    description: 'Filter alert types by master active',
    required: false,
    type: Boolean,
  })
  async getAllAlertTypes(
    @Query('user_active') user_active?: boolean,
    @Query('master_active') master_active?: boolean
  ): Promise<AlertTypeEntity[]> {
    return this.alertingService.findAllAlertTypes(user_active, master_active);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts.' })
  @ApiQuery({
    name: 'backupId',
    description: 'Filter alerts by backup id',
    required: false,
  })
  @ApiQuery({
    name: 'days',
    description: 'Filter alerts by backups of the last x days',
    required: false,
    type: Number,
  })
  async getAllAlerts(
    @Query('backupId') backupId?: string,
    @Query('days') days?: number
  ): Promise<Alert[]> {
    return this.alertingService.getAllAlerts(backupId, days);
  }

  @Post('size')
  @ApiOperation({ summary: 'Create a new size alert.' })
  @ApiNotFoundResponse({ description: 'Backup not found' })
  @ApiBody({ type: CreateSizeAlertDto })
  async createSizeAlert(
    @Body() createSizeAlertDto: CreateSizeAlertDto
  ): Promise<void> {
    await this.alertingService.createSizeAlert(createSizeAlertDto);
  }

  @Get('type/:typeName/latest')
  @ApiOperation({
    summary:
      'Gets the id of the backup with the latest alert of the given type.',
  })
  @ApiNotFoundResponse({ description: 'Alert type not found' })
  @ApiQuery({
    name: 'backupType',
    description: 'Filter by backup type',
    required: false,
    enum: BackupType,
  })
  async getBackupDateFromLatestAlert(
    @Param('typeName') typeName: string,
    @Query('backupType') backupType?: BackupType
  ): Promise<string | null> {
    return this.alertingService.getLatestAlertsBackup(typeName, backupType);
  }
}
