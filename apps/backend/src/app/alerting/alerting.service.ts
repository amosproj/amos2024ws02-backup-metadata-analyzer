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
  Between,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
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
    private readonly storageFillRepository: Repository<StorageFillAlertEntity>,
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
    alertFilterDto: AlertFilterDto
  ): Promise<PaginationDto<Alert>> {
    return this.paginateAlerts<Alert>(
      this.alertRepositories,
      this.alertTypeRepository,
      alertOrderOptionsDto,
      alertFilterDto,
      paginationOptionsDto
    );
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

  async createStorageFillAlerts(
    createStorageFillAlertDtos: CreateStorageFillAlertDto[]
  ) {
    const existingStorageFillAlerts = await this.storageFillRepository.findBy({
      deprecated: false,
    });
    // Analyzer has analyzed all data stores. So if there is an existing alert that is not in the new list of alerts, it is deprecated
    const deprecatedAlerts = existingStorageFillAlerts.filter(
      (alert) =>
        !createStorageFillAlertDtos.find(
          (dto) => dto.dataStoreName === alert.dataStoreName
        )
    );
    for (const alert of deprecatedAlerts) {
      alert.deprecated = true;
      await this.storageFillRepository.save(alert);
    }

    for (const alertDto of createStorageFillAlertDtos) {
      //If alert already exists with same values, ignore new one
      const existingAlertDto = await this.storageFillRepository.findOneBy({
        dataStoreName: alertDto.dataStoreName,
        capacity: alertDto.capacity,
        highWaterMark: alertDto.highWaterMark,
        filled: alertDto.filled,
      });
      if (existingAlertDto) {
        console.log(
          'Storage Fill alert already exists, with no values changed -> ignoring it'
        );
        continue;
      }
      //Do not wait for the alert to have been created
      this.createStorageFillAlert(alertDto);
    }
  }

  private async createStorageFillAlert(
    createStorageFillAlertDto: CreateStorageFillAlertDto
  ) {
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
      this.triggerAlertMail(alert);
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

  createWhereClause(alertFilterDto: AlertFilterDto) {
    const where: FindOptionsWhere<Alert> = {};

    //ID search
    if (alertFilterDto.id) {
      //like search
      where.id = ILike(`%${alertFilterDto.id}%`);
    }

    // backupId search
    if (alertFilterDto.backupId) {
      where.backup = { id: alertFilterDto.backupId };
    }

    // Check if params from and to are valid dates

    let from: Date | null = null;
    let to: Date | null = null;
    if (alertFilterDto.fromDate) {
      from = new Date(alertFilterDto.fromDate);
      if (Number.isNaN(from.getTime())) {
        throw new BadRequestException('parameter fromDate is not a valid date');
      }
      //Set time to first millisecond of the day
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      from.setMilliseconds(0);
    }
    if (alertFilterDto.toDate) {
      to = new Date(alertFilterDto.toDate);
      if (Number.isNaN(to.getTime())) {
        throw new BadRequestException('parameter toDate is not a valid date');
      }
      //Set time to last millisecond of the day
      to.setHours(0);
      to.setMinutes(0);
      to.setSeconds(0);
      to.setDate(to.getDate() + 1);
      to.setMilliseconds(-1);
    }

    //Creation date search
    if (alertFilterDto.fromDate && alertFilterDto.toDate) {
      where.creationDate = Between(from!, to!);
    } else if (alertFilterDto.fromDate) {
      where.creationDate = MoreThanOrEqual(from!);
    } else if (alertFilterDto.toDate) {
      where.creationDate = LessThanOrEqual(to!);
    }

    // severity search
    if (alertFilterDto.severity) {
      where.alertType = { severity: alertFilterDto.severity as SeverityType };
    }

    // alertType search
    if (alertFilterDto.alertType) {
      where.alertType = { name: alertFilterDto.alertType };
    }

    return where;
  }
}
