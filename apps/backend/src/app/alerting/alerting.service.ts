import { Injectable } from '@nestjs/common';
import { MailService } from '../utils/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertEntity } from './entity/alert.entity';
import { Repository } from 'typeorm';
import { CreateAlertDto } from './dto/createAlert.dto';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';

@Injectable()
export class AlertingService {
  constructor(
    @InjectRepository(AlertEntity)
    private alertRepository: Repository<AlertEntity>,
    private mailService: MailService
  ) {}

  async createAlert(createAlertDto: CreateAlertDto) {
    const alert = new AlertEntity();

    alert.type = createAlertDto.type;
    alert.value = createAlertDto.value;
    alert.referenceValue = createAlertDto.referenceValue;
    alert.backup = createAlertDto.backupId as unknown as BackupDataEntity;

    await this.alertRepository.save(alert);
  }

  async findAllAlerts(backupId?: string): Promise<AlertEntity[]> {
    if (backupId) {
      return await this.alertRepository.find({
        where: { backup: { id: backupId } },
      });
    }
    return await this.alertRepository.find();
  }

  async triggerAlertMail(reason: string, description: string) {
    await this.mailService.sendAlertMail(reason, description);
  }
}
