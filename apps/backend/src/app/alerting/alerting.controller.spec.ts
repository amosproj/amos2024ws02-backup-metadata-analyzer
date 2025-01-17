import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertingModule } from './alerting.module';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from '../utils/mail/mail.service';
import { BackupType } from '../backupData/dto/backupType';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { AlertTypeEntity } from './entity/alertType.entity';
import { SeverityType } from './dto/severityType';
import {
  CREATION_DATE_ALERT,
  SIZE_ALERT,
  STORAGE_FILL_ALERT,
} from '../utils/constants';
import { CreationDateAlertEntity } from './entity/alerts/creationDateAlert.entity';
import { TaskEntity } from '../tasks/entity/task.entity';
import { MailReceiverEntity } from '../utils/mail/entity/MailReceiver.entity';
import { StorageFillAlertEntity } from './entity/alerts/storageFillAlert.entity';
import { CreateStorageFillAlertDto } from './dto/alerts/createStorageFillAlert.dto';
import { CreateCreationDateAlertDto } from './dto/alerts/createCreationDateAlert.dto';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';

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

const sizeAlert: SizeAlertEntity = {
  id: 'alert-id',
  size: 100,
  referenceSize: 200,
  backup: mockedBackupDataEntity,
  alertType: mockedSizeAlertTypeEntity,
  creationDate: new Date(),
  deprecated: false,
};

const mockSizeAlertRepository = {
  save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
  find: jest.fn().mockImplementation(() => Promise.resolve([sizeAlert])),
  findOneBy: jest.fn().mockResolvedValue(null),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[sizeAlert], 1]),
  })),
  query: jest.fn().mockResolvedValue([sizeAlert, [{ count: '1' }]]),
};

const mockAlertTypeRepository = {
  findOneBy: jest.fn().mockImplementation(({ name, id }) => {
    if (name === 'SIZE_ALERT' || id === 'active-id') {
      return mockedSizeAlertTypeEntity;
    } else if (id === 'not-active-id') {
      return {
        ...mockedSizeAlertTypeEntity,
        user_active: false,
        master_active: false,
      };
    } else if (name === CREATION_DATE_ALERT) {
      return mockedCreationDateAlertTypeEntity;
    } else if (name === STORAGE_FILL_ALERT) {
      return mockedStorageFillAlertTypeEntity;
    } else {
      return null;
    }
  }),
  save: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
};

const mockCreationDateAlertRepository = {
  save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
  find: jest.fn().mockImplementation(() => Promise.resolve([sizeAlert])),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
  query: jest.fn().mockResolvedValue([[], [{ count: '1' }]]),
  findOneBy: jest.fn().mockResolvedValue(null),
};

const mockStorageFillAlertRepository = {
  save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
  find: jest.fn().mockImplementation(() => Promise.resolve([sizeAlert])),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
  findBy: jest.fn().mockResolvedValue([]),
  query: jest.fn().mockResolvedValue([[], [{ count: '1' }]]),
  findOneBy: jest.fn().mockResolvedValue(null),
};

describe('AlertingController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<SizeAlertEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AlertingModule, ConfigModule.forRoot({ isGlobal: true })],
    })
      .overrideProvider(ConfigService)
      .useValue({
        getOrThrow: jest.fn(() => 'test'),
      })
      .overrideProvider(getRepositoryToken(BackupDataEntity))
      .useValue({
        findOne: jest.fn().mockResolvedValue(mockedBackupDataEntity),
      })
      .overrideProvider(MailService)
      .useValue({
        sendAlertMail: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(SizeAlertEntity))
      .useValue(mockSizeAlertRepository)
      .overrideProvider(getRepositoryToken(CreationDateAlertEntity))
      .useValue(mockCreationDateAlertRepository)
      .overrideProvider(getRepositoryToken(StorageFillAlertEntity))
      .useValue(mockStorageFillAlertRepository)
      .overrideProvider(getRepositoryToken(AlertTypeEntity))
      .useValue(mockAlertTypeRepository)
      .overrideProvider(getRepositoryToken(TaskEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(MailReceiverEntity))
      .useValue({})
      .compile();

    repository = module.get(getRepositoryToken(SizeAlertEntity));
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /alerting - should return paginated alerts', async () => {
    const offset = 0;
    const limit = 10;

    const response = await request(app.getHttpServer())
      .get('/alerting')
      .query({
        offset: offset,
        limit: limit,
      })
      .expect(200);

    expect(response.body).toEqual({
      data: [],
      paginationData: { limit: '10', offset: '0', total: null },
    });
  });

  it('POST /alerting/type - should create a new alert type', async () => {
    const createAlertTypeDto = {
      severity: SeverityType.WARNING,
      name: 'TEST_ALERT',
      master_active: true,
    };

    await request(app.getHttpServer())
      .post('/alerting/type')
      .send(createAlertTypeDto)
      .expect(201);

    expect(mockAlertTypeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(createAlertTypeDto)
    );
  });

  it('POST /alerting/size - should create a new size alert', async () => {
    const createAlertDto: CreateSizeAlertDto = {
      size: 100,
      referenceSize: 200,
      backupId: 'backup-id',
    };

    await request(app.getHttpServer())
      .post('/alerting/size')
      .send(createAlertDto)
      .expect(201);

    expect(mockSizeAlertRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        size: createAlertDto.size,
        referenceSize: createAlertDto.referenceSize,
        backup: expect.objectContaining({ id: createAlertDto.backupId }),
        alertType: expect.objectContaining({ name: SIZE_ALERT }),
      })
    );
  });

  it('POST /alerting/creationDate - should create a new creation date alert', async () => {
    const createCreationDateAlertDto: CreateCreationDateAlertDto = {
      date: new Date('2024-12-01T17:53:33.239Z'),
      backupId: 'backup-id',
      referenceDate: new Date('2024-12-01T17:53:33.239Z'),
    };

    await request(app.getHttpServer())
      .post('/alerting/creationDate')
      .send(createCreationDateAlertDto)
      .expect(201);

    expect(mockCreationDateAlertRepository.save).toHaveBeenCalledWith({
      date: new Date('2024-12-01T17:53:33.239Z').toISOString(),
      referenceDate: new Date('2024-12-01T17:53:33.239Z').toISOString(),
      backup: mockedBackupDataEntity,
      alertType: mockedCreationDateAlertTypeEntity,
    });
  });

  it('POST /alerting/storageFill - should create new storage fill alerts', async () => {
    const createStorageFillAlertDtos: CreateStorageFillAlertDto[] = [
      {
        dataStoreName: 'dataStore1',
        filled: 80,
        highWaterMark: 70,
        capacity: 100,
      },
    ];

    await request(app.getHttpServer())
      .post('/alerting/storageFill')
      .send(createStorageFillAlertDtos)
      .expect(201);

    expect(mockStorageFillAlertRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        dataStoreName: 'dataStore1',
        filled: 80,
        highWaterMark: 70,
        capacity: 100,
        alertType: expect.objectContaining({ name: STORAGE_FILL_ALERT }),
      })
    );
  });

  it('PATCH /alerting/type/:alertTypeId/admin - should activate alert type by admin', async () => {
    const alertTypeId = 'not-active-id';
    const alertStatusDto = { status: true };

    await request(app.getHttpServer())
      .patch(`/alerting/type/${alertTypeId}/admin`)
      .send(alertStatusDto)
      .expect(200);

    expect(mockAlertTypeRepository.save).toHaveBeenCalledWith({
      ...mockedSizeAlertTypeEntity,
      master_active: true,
      user_active: false,
    });
  });

  it('PATCH /alerting/type/:alertTypeId/user - should activate alert type by user', async () => {
    const alertTypeId = 'not-active-id';
    const alertStatusDto = { status: true };

    await request(app.getHttpServer())
      .patch(`/alerting/type/${alertTypeId}/user`)
      .send(alertStatusDto)
      .expect(200);

    expect(mockAlertTypeRepository.save).toHaveBeenCalledWith({
      ...mockedSizeAlertTypeEntity,
      master_active: false,
      user_active: true,
    });
  });
});
