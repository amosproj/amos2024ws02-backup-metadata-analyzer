import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AlertingModule } from './alerting.module';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from '../utils/mail/mail.service';
import { BackupType } from '../backupData/dto/backupType';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { AlertTypeEntity } from './entity/alertType.entity';
import { SeverityType } from './dto/severityType';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';
import {
  CREATION_DATE_ALERT,
  SIZE_ALERT,
  STORAGE_FILL_ALERT,
} from '../utils/constants';
import { CreateCreationDateAlertDto } from './dto/alerts/createCreationDateAlert.dto';
import { CreationDateAlertEntity } from './entity/alerts/creationDateAlert.entity';
import { TaskEntity } from '../tasks/entity/task.entity';
import { MailReceiverEntity } from '../utils/mail/entity/MailReceiver.entity';
import { StorageFillAlertEntity } from './entity/alerts/storageFillAlert.entity';
import { CreateStorageFillAlertDto } from './dto/alerts/createStorageFillAlert.dto';

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
};

const mockSizeAlertRepository = {
  save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
  find: jest.fn().mockImplementation(() => Promise.resolve([sizeAlert])),
  findOneBy: jest.fn().mockResolvedValue(null),
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
  find: jest.fn().mockImplementation(() => Promise.resolve([])),
  findOneBy: jest.fn().mockResolvedValue(null),
};

const mockStorageFillAlertRepository = {
  save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
  find: jest.fn().mockResolvedValue([]),
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

  it('GET /alerting - should return all alerts', async () => {
    const response = await request(app.getHttpServer())
      .get('/alerting')
      .expect(200);

    expect(mockSizeAlertRepository.find).toHaveBeenCalledWith({
      where: {
        alertType: {
          user_active: true,
          master_active: true,
        },
      },
    });
    const receivedAlerts = response.body.map((alert: SizeAlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup?.creationDate ?? ''),
      },
    }));

    expect(receivedAlerts).toEqual([sizeAlert]);
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

  it('GET /alerting - should filter alerts by backupId', async () => {
    const response = await request(app.getHttpServer())
      .get('/alerting')
      .query({ backupId: 'backup-id' })
      .expect(200);

    expect(mockSizeAlertRepository.find).toHaveBeenCalledWith({
      where: {
        backup: { id: 'backup-id' },
        alertType: { user_active: true, master_active: true },
      },
    });

    const receivedAlerts = response.body.map((alert: SizeAlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup?.creationDate ?? ''),
      },
    }));

    expect(receivedAlerts).toEqual([sizeAlert]);
  });

  it('GET /alerting - should filter alerts by the last x days', async () => {
    const days = 7;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const response = await request(app.getHttpServer())
      .get('/alerting')
      .query({ days })
      .expect(200);

    expect(mockSizeAlertRepository.find).toHaveBeenCalledWith({
      where: {
        backup: { creationDate: MoreThanOrEqual(expect.any(Date)) },
        alertType: { user_active: true, master_active: true },
      },
    });

    const receivedAlerts = response.body.map((alert: SizeAlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup?.creationDate ?? ''),
      },
    }));

    expect(receivedAlerts).toEqual([sizeAlert]);
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

  it('POST /alerting/creationDate - should create a new size alert', async () => {
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

  it('POST /alerting/storageFill - should create a new storage fill alert', async () => {
    const createStorageFillAlertDto: CreateStorageFillAlertDto = {
      dataStoreName: 'ExampleDataStore',
      filled: 75.123456,
      highWaterMark: 80.0,
      capacity: 100.0,
    };

    await request(app.getHttpServer())
      .post('/alerting/storageFill')
      .send(createStorageFillAlertDto)
      .expect(201);

    expect(mockStorageFillAlertRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        dataStoreName: createStorageFillAlertDto.dataStoreName,
        filled: createStorageFillAlertDto.filled,
        highWaterMark: createStorageFillAlertDto.highWaterMark,
        capacity: createStorageFillAlertDto.capacity,
      })
    );
  });

  it('GET /alerting/storageFill - should return all storage fill alerts', async () => {
    const mockAlert = {
      dataStoreName: 'ExampleDataStore',
      filled: 75.123,
      highWaterMark: 80.0,
      capacity: 100.0,
    };

    mockStorageFillAlertRepository.find.mockResolvedValue([mockAlert]);

    const response = await request(app.getHttpServer())
      .get('/alerting')
      .expect(200);

    const filteredResponse = response.body.filter(
      (alert: any) => alert.highWaterMark !== undefined
    );

    expect(mockStorageFillAlertRepository.find).toHaveBeenCalled();
    expect(filteredResponse).toEqual([mockAlert]);
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
