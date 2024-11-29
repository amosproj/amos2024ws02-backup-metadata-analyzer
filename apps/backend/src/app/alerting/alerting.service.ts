import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../utils/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertEntity } from './entity/alert.entity';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateAlertDto } from './dto/createAlert.dto';
import { BackupDataService } from '../backupData/backupData.service';
import { CreateAlertTypeDto } from './dto/createAlertType.dto';
import { AlertTypeEntity } from './entity/alertType.entity';
import { Alert } from './entity/alerts/alert';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';

@Injectable()
export class AlertingService {
  const;
  alertRepositories: Repository<any>[] = [];

  constructor(
    @InjectRepository(AlertEntity)
    private alertRepository: Repository<AlertEntity>,
    @InjectRepository(AlertTypeEntity)
    private alertTypeRepository: Repository<AlertTypeEntity>,
    //Alert Repositories
    @InjectRepository(SizeAlertEntity)
    private sizeAlertRepository: Repository<SizeAlertEntity>,
    private mailService: MailService,
    private backupDataService: BackupDataService
  ) {
    this.alertRepositories.push(this.sizeAlertRepository);
  }

  async createAlertType(createAlertTypeDto: CreateAlertTypeDto) {
    const entity = await this.alertTypeRepository.findOneBy({
      name: createAlertTypeDto.name,
    });
    if (entity) {
      throw new ConflictException(
        `Alert type with name ${createAlertTypeDto.name} already exists`
      );
    }
    return await this.alertTypeRepository.save(createAlertTypeDto);
  }

  async findAllAlertTypes(
    user_active?: boolean,
    master_active?: boolean
  ): Promise<AlertTypeEntity[]> {
    const where: FindOptionsWhere<AlertTypeEntity> = {};
    if (user_active) {
      where.user_active = user_active;
    }
    if (master_active) {
      where.master_active = master_active;
    }
    return await this.alertTypeRepository.find({ where });
  }

  async createAlert(createAlertDto: CreateAlertDto) {
    const alert = new AlertEntity();

    alert.type = createAlertDto.type;
    alert.value = createAlertDto.value;
    alert.referenceValue = createAlertDto.referenceValue;
    const backupDataEntity = await this.backupDataService.findOneById(
      createAlertDto.backupId
    );
    if (!backupDataEntity) {
      console.log(`Backup with id ${createAlertDto.backupId} not found`);
      throw new NotFoundException(
        `Backup with id ${createAlertDto.backupId} not found`
      );
    }
    alert.backup = backupDataEntity;

    const existingAlertEntity = await this.alertRepository.findOneBy({
      backup: backupDataEntity,
      type: alert.type,
    });
    if (existingAlertEntity) {
      console.log('Alert already exists -> ignoring it');
      return;
    }
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

  async getAllAlerts(): Promise<Alert[]> {
    //Iterate over all alert repositories and get all alerts
    const alerts: Alert[] = [];
    for (const alertRepository of this.alertRepositories) {
      alerts.push(...(await alertRepository.find()));
    }
    return alerts;
  }

  async createSizeAlert(createSizeAlertDto: CreateSizeAlertDto) {
    // Check if alert already exists
    const existingAlertEntity = await this.sizeAlertRepository.findOneBy({
      backup: { id: createSizeAlertDto.backupId },
    });

    if (existingAlertEntity) {
      console.log('Alert already exists -> ignoring it');
      return;
    }

    const alert = new SizeAlertEntity();
    alert.size = createSizeAlertDto.size;
    alert.referenceSize = createSizeAlertDto.referenceSize;

    const backup = await this.backupDataService.findOneById(
      createSizeAlertDto.backupId
    );
    if (!backup) {
      throw new NotFoundException(
        `Backup with id ${createSizeAlertDto.backupId} not found`
      );
    }
    alert.backup = backup;

    const alertType = await this.alertTypeRepository.findOneBy({
      name: 'SIZE_ALERT',
    });
    if (!alertType) {
      throw new NotFoundException('Alert type SIZE_ALERT not found');
    }
    alert.alertType = alertType;

    await this.sizeAlertRepository.save(alert);

    if (alert.alertType.user_active && alert.alertType.master_active) {
      //await this.triggerAlertMail(alert);
    }
  }
}
