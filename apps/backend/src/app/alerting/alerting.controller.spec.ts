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

const mockedBackupDataEntity: BackupDataEntity = {
  id: 'backup-id',
  sizeMB: 100,
  type: BackupType.FULL,
  creationDate: new Date(),
};

const mockedAlertTypeEntity: AlertTypeEntity = {
  id: 'alert-type-id',
  name: 'SIZE_ALERT',
  severity: SeverityType.WARNING,
  user_active: true,
  master_active: true,
};

const sizeAlert: SizeAlertEntity = {
  id: 'alert-id',
  size: 100,
  referenceSize: 200,
  backup: mockedBackupDataEntity,
  alertType: mockedAlertTypeEntity,
};
const mockAlertRepository = {
  save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
  find: jest.fn().mockImplementation(() => Promise.resolve([sizeAlert])),
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
      .useValue(mockAlertRepository)
      .overrideProvider(getRepositoryToken(AlertTypeEntity))
      .useValue({
        findOneBy: jest.fn().mockImplementation(({ name }) => {
          return name === 'SIZE_ALERT' ? mockedAlertTypeEntity : null;
        }),
        save: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
      })
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

    expect(mockAlertRepository.find).toHaveBeenCalledWith({ where: {} });
    const receivedAlerts = response.body.map((alert: SizeAlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup.creationDate),
      },
    }));

    expect(receivedAlerts).toEqual([sizeAlert]);
  });

  it('GET /alerting - should filter alerts by backupId', async () => {
    const response = await request(app.getHttpServer())
      .get('/alerting')
      .query({ backupId: 'backup-id' })
      .expect(200);

    expect(mockAlertRepository.find).toHaveBeenCalledWith({
      where: { backup: { id: 'backup-id' } },
    });

    const receivedAlerts = response.body.map((alert: SizeAlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup.creationDate),
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

    expect(mockAlertRepository.find).toHaveBeenCalledWith({
      where: { backup: { creationDate: MoreThanOrEqual(expect.any(Date)) } },
    });

    const receivedAlerts = response.body.map((alert: SizeAlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup.creationDate),
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

    expect(mockAlertRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        size: createAlertDto.size,
        referenceSize: createAlertDto.referenceSize,
        backup: expect.objectContaining({ id: createAlertDto.backupId }),
        alertType: expect.objectContaining({ name: 'SIZE_ALERT' }),
      })
    );
  });
});
