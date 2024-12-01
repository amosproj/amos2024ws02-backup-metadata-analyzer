import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../utils/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { BackupDataService } from '../backupData/backupData.service';
import { CreateAlertTypeDto } from './dto/createAlertType.dto';
import { AlertTypeEntity } from './entity/alertType.entity';
import { Alert } from './entity/alerts/alert';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { CreationDateEntity } from './entity/alerts/creationDate.entity';
import { CreateCreationDateAlertDto } from './dto/alerts/createCreationDateAlert.dto';
import { CREATION_DATE_ALERT, SIZE_ALERT } from '../utils/constants';

@Injectable()
export class AlertingService {
  alertRepositories: Repository<any>[] = [];

  constructor(
    @InjectRepository(AlertTypeEntity)
    private alertTypeRepository: Repository<AlertTypeEntity>,
    //Alert Repositories
    @InjectRepository(SizeAlertEntity)
    private sizeAlertRepository: Repository<SizeAlertEntity>,
    @InjectRepository(CreationDateEntity)
    private creationDateRepository: Repository<CreationDateEntity>,
    //Services
    private mailService: MailService,
    private backupDataService: BackupDataService
  ) {
    this.alertRepositories.push(this.sizeAlertRepository);
    this.alertRepositories.push(this.creationDateRepository);
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

  async triggerAlertMail(alert: Alert) {
    await this.mailService.sendAlertMail(alert);
  }

  async getAllAlerts(backupId?: string, days?: number): Promise<Alert[]> {
    const where: FindOptionsWhere<Alert> = {};
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
      name: SIZE_ALERT,
    });
    if (!alertType) {
      throw new NotFoundException(`Alert type ${SIZE_ALERT} not found`);
    }
    alert.alertType = alertType;

    await this.sizeAlertRepository.save(alert);

    if (alert.alertType.user_active && alert.alertType.master_active) {
      await this.triggerAlertMail(alert);
    }
  }

  async createCreationDateAlert(
    createCreationDateAlertDto: CreateCreationDateAlertDto
  ) {
    // Check if alert already exists
    const existingAlertEntity = await this.creationDateRepository.findOneBy({
      backup: { id: createCreationDateAlertDto.backupId },
    });

    if (existingAlertEntity) {
      console.log('Alert already exists -> ignoring it');
      return;
    }

    const alert = new CreationDateEntity();
    //TODO: Implement the missing properties

    const backup = await this.backupDataService.findOneById(
      createCreationDateAlertDto.backupId
    );
    if (!backup) {
      throw new NotFoundException(
        `Backup with id ${createCreationDateAlertDto.backupId} not found`
      );
    }
    alert.backup = backup;

    const alertType = await this.alertTypeRepository.findOneBy({
      name: CREATION_DATE_ALERT,
    });
    if (!alertType) {
      throw new NotFoundException(`Alert type ${CREATION_DATE_ALERT} not found`);
    }
    alert.alertType = alertType;

    await this.creationDateRepository.save(alert);

    if (alert.alertType.user_active && alert.alertType.master_active) {
      await this.triggerAlertMail(alert);
    }
  }
}
