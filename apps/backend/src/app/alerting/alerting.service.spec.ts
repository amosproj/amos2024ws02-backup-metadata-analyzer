import { Test, TestingModule } from '@nestjs/testing';
import { AlertingService } from './alerting.service';
import { MailService } from '../utils/mail/mail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { BackupDataService } from '../backupData/backupData.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';
import { AlertTypeEntity } from './entity/alertType.entity';
import { CreateAlertTypeDto } from './dto/createAlertType.dto';
import { SeverityType } from './dto/severityType';
import { Alert } from './entity/alerts/alert';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupType } from '../backupData/dto/backupType';
import {
  CREATION_DATE_ALERT,
  SIZE_ALERT,
  STORAGE_FILL_ALERT,
} from '../utils/constants';
import { CreateCreationDateAlertDto } from './dto/alerts/createCreationDateAlert.dto';
import { CreationDateAlertEntity } from './entity/alerts/creationDateAlert.entity';
import { StorageFillAlertEntity } from './entity/alerts/storageFillAlert.entity';
import { AlertFilterDto } from './dto/alertFilter.dto';
import { AlertOrderOptionsDto } from './dto/alertOrderOptions.dto';
import { PaginationDataDto } from '../utils/pagination/PaginationDto';

const mockedBackupDataEntity: BackupDataEntity = {
  id: 'backup-id',
  sizeMB: 100,
  type: BackupType.FULL,
  creationDate: new Date(),
  saveset: 'saveset1',
};

const mockedSizeAlertTypeEntity: AlertTypeEntity = {
  id: 'alert-type-id1',
  name: SIZE_ALERT,
  severity: SeverityType.WARNING,
  user_active: true,
  master_active: true,
};

const mockedCreationDateAlertTypeEntity: AlertTypeEntity = {
  id: 'alert-type-id2',
  name: CREATION_DATE_ALERT,
  severity: SeverityType.WARNING,
  user_active: true,
  master_active: true,
};

const mockedStorageFillAlertTypeEntity: AlertTypeEntity = {
  id: 'storage-fill-alert1',
  name: STORAGE_FILL_ALERT,
  severity: SeverityType.WARNING,
  user_active: true,
  master_active: true,
};

const sizeAlertEntities: SizeAlertEntity[] = [
  {
    id: 'alert-id',
    size: 100,
    referenceSize: 200,
    backup: mockedBackupDataEntity,
    alertType: mockedSizeAlertTypeEntity,
    creationDate: new Date(),
  },
];

const sizeAlert: SizeAlertEntity = {
  id: 'alert-id',
  size: 100,
  referenceSize: 200,
  backup: mockedBackupDataEntity,
  alertType: mockedSizeAlertTypeEntity,
  creationDate: new Date(),
};

const creationDateAlertEntities: CreationDateAlertEntity[] = [
  {
    id: 'alert-id',
    date: new Date(),
    referenceDate: new Date(),
    backup: mockedBackupDataEntity,
    alertType: mockedCreationDateAlertTypeEntity,
    creationDate: new Date(),
  },
];

describe('AlertingService', () => {
  let service: AlertingService;
  let sizeAlertRepository: Repository<SizeAlertEntity>;
  let creationDateAlertEntityRepository: Repository<CreationDateAlertEntity>;
  let alertTypeRepository: Repository<AlertTypeEntity>;
  let mailService: MailService;
  let backupDataService: BackupDataService;
  let storageFillAlertEntityRepsitory: Repository<StorageFillAlertEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
      AlertingService,
      {
        provide: getRepositoryToken(SizeAlertEntity),
        useValue: {
        save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
        find: jest.fn().mockImplementation(() => Promise.resolve(sizeAlertEntities)),
        findOne: jest.fn().mockImplementation(({ where: { id } }) => {
          if (id === 'alert-id') {
            return sizeAlert;
          }
            return sizeAlert;
          }),
          findOneBy: jest.fn().mockResolvedValue(null),
          createQueryBuilder: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([sizeAlertEntities, sizeAlertEntities.length]),
          })),
          query: jest.fn()
            .mockResolvedValueOnce([{alertTypeId: sizeAlert.alertType.id, backupId: sizeAlert.backup?.id, severity: sizeAlert.alertType.severity, creationDate: sizeAlert.creationDate }])
            .mockResolvedValue([{count: 1}]),
          },
          },
          {
          provide: getRepositoryToken(CreationDateAlertEntity),
          useValue: {
          save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
          find: jest.fn().mockImplementation(() => Promise.resolve(creationDateAlertEntities)),
          createQueryBuilder: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([creationDateAlertEntities, creationDateAlertEntities.length]),
          })),
          query: jest.fn().mockResolvedValue([creationDateAlertEntities, [{ count: creationDateAlertEntities.length.toString() }]]),
          findOneBy: jest.fn().mockResolvedValue(null),
          },
          },
          {
          provide: getRepositoryToken(AlertTypeEntity),
          useValue: {
          findOneBy: jest.fn().mockImplementation(({ name, id }) => {
          if (name === SIZE_ALERT || id === 'active-id') {
          return mockedSizeAlertTypeEntity;
          } else if (id === 'not-active-id') {
          return {
            ...mockedSizeAlertTypeEntity,
            user_active: false,
            master_active: false,
          };
          } else if (name === CREATION_DATE_ALERT) {
          return mockedCreationDateAlertTypeEntity;
          } else {
          return null;
          }
        }),
        save: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(mockedSizeAlertTypeEntity),
        },
      },
      {
        provide: getRepositoryToken(StorageFillAlertEntity),
        useValue: {
        save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
        find: jest.fn().mockImplementation(() => Promise.resolve([])),
        createQueryBuilder: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        })),
        query: jest.fn().mockResolvedValue([creationDateAlertEntities, [{ count: creationDateAlertEntities.length.toString() }]]),
        findOneBy: jest.fn().mockResolvedValue(null),
        },
      },
      {
        provide: MailService,
        useValue: {
        sendAlertMail: jest.fn(),
        },
      },
      {
        provide: BackupDataService,
        useValue: {
        findOneById: jest.fn().mockImplementation((id: string) => {
          if (id === 'backup-id') {
          return mockedBackupDataEntity;
          }
          return null;
        }),
        },
      },
      ],
    }).compile();

    service = module.get(AlertingService);
    sizeAlertRepository = module.get(getRepositoryToken(SizeAlertEntity));
    creationDateAlertEntityRepository = module.get(
      getRepositoryToken(CreationDateAlertEntity)
    );
    alertTypeRepository = module.get(getRepositoryToken(AlertTypeEntity));
    mailService = module.get(MailService);
    backupDataService = module.get(BackupDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ensureAlertTypesExist', () => {
    it('should add default alert types if they do not exist', async () => {
      jest.spyOn(alertTypeRepository, 'findOneBy').mockResolvedValue(null);

      await service.ensureAlertTypesExist();

      expect(alertTypeRepository.save).toHaveBeenCalledTimes(3);
      expect(alertTypeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: SIZE_ALERT })
      );
      expect(alertTypeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: CREATION_DATE_ALERT })
      );
      expect(alertTypeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: STORAGE_FILL_ALERT })
      );
    });

    it('should not add alert types if they already exist', async () => {
      jest.spyOn(alertTypeRepository, 'findOneBy').mockResolvedValue({
        id: 'a',
        name: SIZE_ALERT,
        severity: SeverityType.WARNING,
        user_active: true,
        master_active: true,
      });

      await service.ensureAlertTypesExist();

      expect(alertTypeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('createSizeAlert', () => {
    it('should create and save a size alert', async () => {
      const createSizeAlertDto: CreateSizeAlertDto = {
        size: 100,
        referenceSize: 200,
        backupId: 'backup-id',
      };

      await service.createSizeAlert(createSizeAlertDto);

      expect(backupDataService.findOneById).toHaveBeenCalledWith('backup-id');
      expect(sizeAlertRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 100,
          referenceSize: 200,
          backup: mockedBackupDataEntity,
        })
      );
      expect(mailService.sendAlertMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCreationDateAlert', () => {
    it('should create and save a creation date alert', async () => {
      const createCreationDateAlertDto: CreateCreationDateAlertDto = {
        backupId: 'backup-id',
        date: new Date('2021-01-01'),
        referenceDate: new Date('2021-01-02'),
      };

      await service.createCreationDateAlert(createCreationDateAlertDto);

      expect(backupDataService.findOneById).toHaveBeenCalledWith('backup-id');
      expect(creationDateAlertEntityRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          date: new Date('2021-01-01'),
          referenceDate: new Date('2021-01-02'),
          backup: mockedBackupDataEntity,
          alertType: mockedCreationDateAlertTypeEntity,
        })
      );
      expect(mailService.sendAlertMail).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if backup not found', async () => {
      const createCreationDateAlertDto: CreateCreationDateAlertDto = {
        backupId: 'not-existing-id',
        date: new Date('2021-01-01'),
        referenceDate: new Date('2021-01-02'),
      };

      await expect(
        service.createCreationDateAlert(createCreationDateAlertDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAlertType', () => {
    it('should create and save an alert type', async () => {
      const createAlertTypeDto: CreateAlertTypeDto = {
        severity: SeverityType.WARNING,
        name: 'TEST_ALERT',
        master_active: true,
      };

      await service.createAlertType(createAlertTypeDto);

      expect(alertTypeRepository.findOneBy).toHaveBeenCalledWith({
        name: 'TEST_ALERT',
      });
      expect(alertTypeRepository.save).toHaveBeenCalledWith(createAlertTypeDto);
    });

    it('should throw ConflictException if alert type already exists', async () => {
      const createAlertTypeDto: CreateAlertTypeDto = {
        severity: SeverityType.WARNING,
        name: SIZE_ALERT,
        master_active: true,
      };

      await expect(service.createAlertType(createAlertTypeDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAllAlertTypes', () => {
    it('should return all alert types', async () => {
      const result = await service.findAllAlertTypes();

      expect(result).toEqual([]);
      expect(alertTypeRepository.find).toHaveBeenCalled();
    });

    it('should return alert types with user_active and master_active filters', async () => {
      const result = await service.findAllAlertTypes(true, true);

      expect(result).toEqual([]);
      expect(alertTypeRepository.find).toHaveBeenCalledWith({
        where: { user_active: true, master_active: true },
      });
    });
  });

  describe('findAllAlerts', () => {
    it('should return all alerts', async () => {
      const result = await service.getAllAlertsPaginated(
        {limit: 10, offset: 0},
        new AlertOrderOptionsDto(),
        {}
      );

      expect(result).toEqual(
        {
        data: [sizeAlert],
        paginationData: {limit: 10, offset: 0, total: 1}
      });
    });

    it('should return alerts for a specific backup', async () => {
      const result = await service.getAllAlertsPaginated(
        {limit: 10, offset: 0},
        new AlertOrderOptionsDto(),
        {id: 'alert-id'}
      )

      expect(result).toEqual(        {
        data: [sizeAlert],
        paginationData: {limit: 10, offset: 0, total: 1}
      });
    });

    it('should return alerts for the last x days', async () => {
      const days = 7;
      const date = new Date();
      date.setDate(date.getDate() - days);

      const result = await service.getAllAlertsPaginated(
        {},
        {},
        { fromDate: date.toDateString() }
      );

      expect(result).toEqual(
        {
          data: [sizeAlert],
          paginationData: {limit: 10, offset: 0, total: 1}
        }
      );
    });
  });

  describe('triggerAlertMail', () => {
    it('should call sendAlertMail of MailService', async () => {
      const alert: Alert = sizeAlertEntities[0];

      await service.triggerAlertMail(alert);

      expect(mailService.sendAlertMail).toHaveBeenCalledWith(alert);
    });
  });

  describe('adminChangeActiveStatusAlertType', () => {
    it('should activate alert type by admin', async () => {
      const alertTypeId = 'not-active-id';
      const alertStatusDto = { status: true };

      await service.adminChangeActiveStatusAlertType(alertTypeId, true);

      expect(alertTypeRepository.save).toHaveBeenCalledWith({
        ...mockedSizeAlertTypeEntity,
        master_active: true,
        user_active: false,
      });
    });

    it('should deactivate alert type by admin', async () => {
      const alertTypeId = 'active-id';

      await service.adminChangeActiveStatusAlertType(alertTypeId, false);

      expect(alertTypeRepository.save).toHaveBeenCalledWith({
        ...mockedSizeAlertTypeEntity,
        master_active: false,
      });
    });
  });

  describe('userChangeActiveStatusAlertType', () => {
    it('should activate alert type by admin', async () => {
      const alertTypeId = 'not-active-id';

      await service.userChangeActiveStatusAlertType(alertTypeId, true);

      expect(alertTypeRepository.save).toHaveBeenCalledWith({
        ...mockedSizeAlertTypeEntity,
        master_active: false,
        user_active: true,
      });
    });

    it('should deactivate alert type by admin', async () => {
      const alertTypeId = 'active-id';

      await service.userChangeActiveStatusAlertType(alertTypeId, false);

      expect(alertTypeRepository.save).toHaveBeenCalledWith({
        ...mockedSizeAlertTypeEntity,
        user_active: false,
      });
    });
  });
});
