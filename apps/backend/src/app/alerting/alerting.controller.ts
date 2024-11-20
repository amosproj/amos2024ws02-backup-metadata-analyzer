import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AlertingService } from './alerting.service';
import { AlertingInformationDto } from './dto/alertingInformation.dto';

@Controller('alerting')
export class AlertingController {
  readonly logger = new Logger(AlertingController.name);

  constructor(private readonly alertingService: AlertingService) {}

  @Post()
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
