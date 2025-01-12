import { Injectable } from '@nestjs/common';
import { BackupInformationDto } from './dto/backupInformation.dto';
import { BackupDataService } from '../backupData/backupData.service';

@Injectable()
export class InformationService {
  constructor(private readonly backupDataService: BackupDataService) {}

  async getBackupInformation(): Promise<BackupInformationDto> {
    return await this.backupDataService.getTotalBackupInformation();
  }
}
