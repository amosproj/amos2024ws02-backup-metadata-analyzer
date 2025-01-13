import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
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
import { StorageFillAlertEntity } from './entity/alerts/storageFillAlert.entity';
import { CreateStorageFillAlertDto } from './dto/alerts/createStorageFillAlert.dto';
import { BackupType } from '../backupData/dto/backupType';
import { CreationDateAlertEntity } from './entity/alerts/creationDateAlert.entity';
import { CreateCreationDateAlertDto } from './dto/alerts/createCreationDateAlert.dto';
import {
  CREATION_DATE_ALERT,
  SIZE_ALERT,
  STORAGE_FILL_ALERT,
} from '../utils/constants';
import { SeverityType } from './dto/severityType';
import { PaginationDto } from '../utils/pagination/PaginationDto';
import { PaginationOptionsDto } from '../utils/pagination/PaginationOptionsDto';
import { AlertOrderOptionsDto } from './dto/alertOrderOptions.dto';
import { AlertFilterDto } from './dto/alertFilter.dto';
import { PaginationService } from '../utils/pagination/paginationService';

@Injectable()
export class AlertingService extends PaginationService implements OnModuleInit {
  alertRepositories: Repository<any>[] = [];

  constructor(
    @InjectRepository(AlertTypeEntity)
    private readonly alertTypeRepository: Repository<AlertTypeEntity>,
    //Alert Repositories
    @InjectRepository(SizeAlertEntity)
    private readonly sizeAlertRepository: Repository<SizeAlertEntity>,
    @InjectRepository(CreationDateAlertEntity)
    private readonly creationDateRepository: Repository<CreationDateAlertEntity>,
    @InjectRepository(StorageFillAlertEntity)
    private storageFillRepository: Repository<StorageFillAlertEntity>,
    //Services
    private readonly mailService: MailService,
    private readonly backupDataService: BackupDataService
  ) {
    super();
    this.alertRepositories.push(this.sizeAlertRepository);
    this.alertRepositories.push(this.creationDateRepository);
    this.alertRepositories.push(this.storageFillRepository);
  }

  async onModuleInit() {
    await this.ensureAlertTypesExist();
  }

  /**
   * Init database table alert types with default values if not already present
   */
  async ensureAlertTypesExist() {
    const alertTypes: CreateAlertTypeDto[] = [
      {
        name: SIZE_ALERT,
        master_active: true,
        severity: SeverityType.WARNING,
      },
      {
        name: CREATION_DATE_ALERT,
        master_active: true,
        severity: SeverityType.WARNING,
      },
      {
        name: STORAGE_FILL_ALERT,
        master_active: true,
        severity: SeverityType.WARNING,
      },
    ];

    for (const alertType of alertTypes) {
      const existingAlertType = await this.alertTypeRepository.findOneBy({
        name: alertType.name,
      });
      if (!existingAlertType) {
        await this.alertTypeRepository.save(alertType);
      }
    }
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

  async userChangeActiveStatusAlertType(alertTypeId: string, status: boolean) {
    const alertType = await this.findAlertTypeByIdOrThrow(alertTypeId);
    alertType.user_active = status;
    return await this.alertTypeRepository.save(alertType);
  }

  async adminChangeActiveStatusAlertType(alertTypeId: string, status: boolean) {
    const alertType = await this.findAlertTypeByIdOrThrow(alertTypeId);
    alertType.master_active = status;
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

  async getAllAlertsPaginated(
    paginationOptionsDto: PaginationOptionsDto,
    alertOrderOptionsDto: AlertOrderOptionsDto,
    alertFilterDto: AlertFilterDto,
  ): Promise<PaginationDto<Alert>> {
    return this.paginateAlerts<Alert>(
      this.alertRepositories,
      this.alertTypeRepository,
      // this.createOrderClause(alertOrderOptionsDto),
      // this.createWhereClause(alertFilterDto),
      paginationOptionsDto
    );
  }

  async getAllAlerts(backupId?: string, days?: number): Promise<Alert[]> {
    const where: FindOptionsWhere<Alert> = {
      alertType: { user_active: true, master_active: true },
    };
    if (backupId) {
      where.backup = { id: backupId };
    }
    const date = new Date();
    if (days) {
      date.setDate(date.getDate() - days);
      where.backup = { creationDate: MoreThanOrEqual(date) };
    }

    const alerts: Alert[] = [];
    for (const alertRepository of this.alertRepositories) {
      if (alertRepository === this.storageFillRepository) {
        alerts.push(
          ...(await alertRepository.find({
            where: {
              alertType: {
                user_active: true,
                master_active: true,
              },
              creationDate: days ? MoreThanOrEqual(date) : undefined,
            },
          }))
        );
      } else {
        alerts.push(...(await alertRepository.find({ where })));
      }
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

    const alert = new CreationDateAlertEntity();
    alert.date = createCreationDateAlertDto.date;
    alert.referenceDate = createCreationDateAlertDto.referenceDate;

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
      throw new NotFoundException(
        `Alert type ${CREATION_DATE_ALERT} not found`
      );
    }
    alert.alertType = alertType;

    await this.creationDateRepository.save(alert);

    if (alert.alertType.user_active && alert.alertType.master_active) {
      await this.triggerAlertMail(alert);
    }
  }

  async createStorageFillAlert(
    createStorageFillAlertDto: CreateStorageFillAlertDto
  ) {
    // Check if alert already exists
    const existingAlertEntity = await this.storageFillRepository.findOneBy({
      filled: createStorageFillAlertDto.filled,
      dataStoreName: createStorageFillAlertDto.dataStoreName,
    });

    if (existingAlertEntity) {
      console.log('Alert already exists -> ignoring it');
      return;
    }

    const alert = new StorageFillAlertEntity();
    alert.filled = createStorageFillAlertDto.filled;
    alert.highWaterMark = createStorageFillAlertDto.highWaterMark;
    alert.dataStoreName = createStorageFillAlertDto.dataStoreName;
    alert.capacity = createStorageFillAlertDto.capacity;

    const alertType = await this.alertTypeRepository.findOneBy({
      name: STORAGE_FILL_ALERT,
    });
    if (!alertType) {
      throw new NotFoundException(`Alert type ${STORAGE_FILL_ALERT} not found`);
    }
    alert.alertType = alertType;

    await this.storageFillRepository.save(alert);

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

  async getLatestAlertsBackup(
    alertTypeName: string,
    backupType?: BackupType
  ): Promise<string | null> {
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
        break;
      }
      case 'CREATION_DATE_ALERT': {
        alert = await this.creationDateRepository.findOne(options);
        break;
      }
      case 'STORAGE_FILL_ALERT': {
        throw new BadRequestException(
          'Method not supported for alert type STORAGE_FILL_ALERT'
        );
      }
    }

    if (!alert) {
      return null;
    }
    if (!alert.backup) {
      throw new BadRequestException();
    }

    return alert.backup.id;
  }
}
