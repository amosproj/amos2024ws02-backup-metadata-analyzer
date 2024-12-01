import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AlertingService } from './alerting.service';
import { AlertEntity } from './entity/alert.entity';
import { CreateAlertDto } from './dto/createAlert.dto';

@Controller('alerting')
export class AlertingController {
  readonly logger = new Logger(AlertingController.name);

  constructor(private readonly alertingService: AlertingService) {}

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
  ): Promise<AlertEntity[]> {
    return this.alertingService.findAllAlerts(backupId, days);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new alert.' })
  @ApiNotFoundResponse({ description: 'Backup not found' })
  async createAlert(@Body() createAlertDto: CreateAlertDto): Promise<void> {
    await this.alertingService.createAlert(createAlertDto);
  }
}
