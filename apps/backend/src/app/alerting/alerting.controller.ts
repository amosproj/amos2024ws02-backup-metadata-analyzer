import {
  Body,
  Controller,
  Get,
  Logger,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AlertingService } from './alerting.service';
import { AlertingInformationDto } from './dto/alertingInformation.dto';
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
  async getAllAlerts(
    @Query('backupId', ParseUUIDPipe) backupId?: string
  ): Promise<AlertEntity[]> {
    return this.alertingService.findAllAlerts(backupId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new alert.' })
  async createAlert(@Body() createAlertDto: CreateAlertDto): Promise<void> {
    await this.alertingService.createAlert(createAlertDto);
  }

  @Post('mail')
  @ApiOperation({ summary: 'Send an alert mail with the given informations.' })
  async sendAlertMail(
    @Body() alertingInformationDto: AlertingInformationDto
  ): Promise<void> {
    await this.alertingService.triggerAlertMail(
      alertingInformationDto.reason,
      alertingInformationDto.description
    );
  }
}
