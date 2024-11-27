import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AlertingModule } from './alerting.module';
import { AlertEntity } from './entity/alert.entity';
import { CreateAlertDto } from './dto/createAlert.dto';
import { AlertType } from './dto/alertType';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from '../utils/mail/mail.service';
import { BackupType } from '../backupData/dto/backupType';

const mockBackupDataEntity: BackupDataEntity = {
  id: 'backup-id',
  sizeMB: 100,
  type: BackupType.FULL,
  creationDate: new Date('2023-12-30 00:00:00.000000'),
};

const mockAlertEntity: AlertEntity = {
  id: 'alert-id',
  type: AlertType.SIZE_DECREASED,
  value: 100,
  referenceValue: 200,
  backup: mockBackupDataEntity,
};

const mockAlertRepository = {
  save: jest.fn().mockImplementation((alert) => Promise.resolve(alert)),
  find: jest.fn().mockImplementation(() => Promise.resolve([mockAlertEntity])),
  findOneBy: jest.fn().mockResolvedValue(null),
};

describe('AlertingController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<AlertEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AlertingModule, await ConfigModule.forRoot({ isGlobal: true })],
    })
      .overrideProvider(ConfigService)
      .useValue({
        getOrThrow: jest.fn(() => {
          return 'test';
        }),
      })

      .overrideProvider(getRepositoryToken(BackupDataEntity))
      .useValue({
        findOne: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockBackupDataEntity)),
      })

      .overrideProvider(MailService)
      .useValue({
        sendAlertMail: jest.fn(),
      })

      .overrideProvider(getRepositoryToken(AlertEntity))
      .useValue(mockAlertRepository)

      .compile();

    repository = module.get(getRepositoryToken(AlertEntity));

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

    expect(mockAlertRepository.find).toHaveBeenCalledWith();
    // Convert creationDate to Date object for comparison
    const receivedAlerts = response.body.map((alert: AlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup.creationDate),
      },
    }));

    expect(receivedAlerts).toEqual([mockAlertEntity]);
  });

  it('GET /alerting - should filter alerts by backupId', async () => {
    const response = await request(app.getHttpServer())
      .get('/alerting')
      .query({ backupId: 'backup-id' })
      .expect(200);
    expect(mockAlertRepository.find).toHaveBeenCalledWith({
      where: { backup: { id: 'backup-id' } },
    });

    // Convert creationDate to Date object for comparison
    const receivedAlerts = response.body.map((alert: AlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup.creationDate),
      },
    }));

    expect(receivedAlerts).toEqual([mockAlertEntity]);
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

    // Convert creationDate to Date object for comparison
    const receivedAlerts = response.body.map((alert: AlertEntity) => ({
      ...alert,
      backup: {
        ...alert.backup,
        creationDate: new Date(alert.backup.creationDate),
      },
    }));

    expect(receivedAlerts).toEqual([mockAlertEntity]);
  });

  it('POST /alerting - should create a new alert', async () => {
    const createAlertDto: CreateAlertDto = {
      type: AlertType.SIZE_DECREASED,
      value: 100,
      referenceValue: 200,
      backupId: 'backup-id',
    };

    await request(app.getHttpServer())
      .post('/alerting')
      .send(createAlertDto)
      .expect(201);

    expect(mockAlertRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        type: createAlertDto.type,
        value: createAlertDto.value,
        referenceValue: createAlertDto.referenceValue,
        backup: expect.objectContaining({ id: createAlertDto.backupId }),
      })
    );
  });
  it('GET /alerting/:id - should return 404 if alert not found', async () => {
    const nonExistentId = 'non-existent-id';
    mockAlertRepository.find.mockImplementationOnce(() =>
      Promise.resolve(null)
    );

    const response = await request(app.getHttpServer())
      .get(`/alerting/${nonExistentId}`)
      .expect(404);
  });
});
