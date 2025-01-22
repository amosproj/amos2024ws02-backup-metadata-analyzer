import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InformationService } from './information.service';
import { BackupInformationDto } from './dto/backupInformation.dto';

@ApiTags('Informations')
@Controller('information')
export class InformationController {
  readonly logger = new Logger(InformationController.name);

  constructor(private readonly informationService: InformationService) {}

  @Get()
  @ApiOperation({
    summary: 'Returns informations about metadata of our analysis',
  })
  @ApiOkResponse({
    description: 'Informations about metadata of our analysis',
    type: BackupInformationDto,
  })
  async getBackupInformation(): Promise<BackupInformationDto> {
    return this.informationService.getBackupInformation();
  }
}
