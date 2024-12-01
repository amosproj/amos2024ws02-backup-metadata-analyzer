import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../utils/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  FindOptionsWhere,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BackupDataService } from '../backupData/backupData.service';
import { CreateAlertTypeDto } from './dto/createAlertType.dto';
import { AlertTypeEntity } from './entity/alertType.entity';
import { Alert } from './entity/alerts/alert';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { BackupType } from '../backupData/dto/backupType';

@Injectable()
export class AlertingService {
  alertRepositories: Repository<any>[] = [];

  constructor(
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

  async userActivateAlertType(alertTypeId: string) {
    const alertType = await this.findAlertTypeByIdOrThrow(alertTypeId);
    alertType.user_active = true;
    return await this.alertTypeRepository.save(alertType);
  }

  async userDeactivateAlertType(alertTypeId: string) {
    const alertType = await this.findAlertTypeByIdOrThrow(alertTypeId);
    alertType.user_active = false;
    return await this.alertTypeRepository.save(alertType);
  }

  async adminActivateAlertType(alertTypeId: string) {
    const alertType = await this.findAlertTypeByIdOrThrow(alertTypeId);
    alertType.master_active = true;
    return await this.alertTypeRepository.save(alertType);
  }

  async adminDeactivateAlertType(alertTypeId: string) {
    const alertType = await this.findAlertTypeByIdOrThrow(alertTypeId);
    alertType.master_active = false;
    return await this.alertTypeRepository.save(alertType);
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

  async triggerAlertMail(alert: Alert) {
    await this.mailService.sendAlertMail(alert);
  }

  async getAllAlerts(backupId?: string, days?: number): Promise<Alert[]> {
    const where: FindOptionsWhere<Alert> = {
      alertType: { user_active: true, master_active: true },
    };
    if (backupId) {
      where.backup = { id: backupId };
    }
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.backup = { creationDate: MoreThanOrEqual(date) };
    }

    //Iterate over all alert repositories and get all alerts
    const alerts: Alert[] = [];
    for (const alertRepository of this.alertRepositories) {
      alerts.push(...(await alertRepository.find({ where })));
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
      await this.triggerAlertMail(alert);
    }
  }

  private async findAlertTypeByIdOrThrow(id: string): Promise<AlertTypeEntity> {
    const entity = await this.alertTypeRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`Alert type with id ${id} not found`);
    }
    return entity;
  }

  async getBackupDateFromLatestAlert(
    alertTypeName: string,
    backupType?: BackupType
  ): Promise<Date | null> {
    const alertType = await this.alertTypeRepository.findOneBy({
      name: alertTypeName,
    });
    if (!alertType) {
      throw new NotFoundException(`Alert type ${alertTypeName} not found`);
    }

    const options: FindOneOptions = {
      where: {
        alertType: { id: alertType.id },
        backup: { type: backupType },
      },
      order: {
        backup: { creationDate: 'DESC' },
      },
    };

    let alert: Alert | null = null;
    switch (alertType.name) {
      case 'SIZE_ALERT': {
        alert = await this.sizeAlertRepository.findOne(options);
      }
      //TODO: add creationDate Alert as soon as it is implemented
    }

    if (!alert) {
      return null;
    }

    return alert.backup.creationDate;
  }
}
