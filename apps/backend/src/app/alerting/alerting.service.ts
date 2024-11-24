import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../utils/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertEntity } from './entity/alert.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateAlertDto } from './dto/createAlert.dto';
import { BackupDataService } from '../backupData/backupData.service';

@Injectable()
export class AlertingService {
  constructor(
    @InjectRepository(AlertEntity)
    private alertRepository: Repository<AlertEntity>,
    private mailService: MailService,
    private backupDataService: BackupDataService
  ) {}

  async createAlert(createAlertDto: CreateAlertDto) {
    const alert = new AlertEntity();

    alert.type = createAlertDto.type;
    alert.value = createAlertDto.value;
    alert.referenceValue = createAlertDto.referenceValue;
    const backupDataEntity = await this.backupDataService.findOneById(
      createAlertDto.backupId
    );
    if (!backupDataEntity) {
      throw new NotFoundException(
        `Backup with id ${createAlertDto.backupId} not found`
      );
    }
    alert.backup = backupDataEntity;

    const entity = await this.alertRepository.save(alert);
    await this.triggerAlertMail(entity);
  }

  async findAllAlerts(
    backupId?: string,
    days?: number
  ): Promise<AlertEntity[]> {
    if (backupId) {
      return await this.alertRepository.find({
        where: { backup: { id: backupId } },
      });
    }
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return await this.alertRepository.find({
        where: { backup: { creationDate: MoreThanOrEqual(date) } },
      });
    }
    return await this.alertRepository.find();
  }

  async triggerAlertMail(alert: AlertEntity) {
    await this.mailService.sendAlertMail(alert);
  }
}
