import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BackupDataEntity } from './entity/backupData.entity';
import { CreateBackupDataDto } from './dto/createBackupData.dto';
import { BackupDataModule } from './backupData.module';
import { BackupType } from './dto/backupType';

const mockBackupDataEntity: BackupDataEntity = {
  id: '123e4567-e89b-12d3-a456-426614174062',
  sizeMB: 100,
  type: BackupType.FULL,
  creationDate: new Date('2023-12-30 00:00:00.000000'),
};

const mockBackupDataRepository = {
  save: jest
    .fn()
    .mockImplementation((backupData) => Promise.resolve(backupData)),
  findOne: jest
    .fn()
    .mockImplementation(({ where: { id } }) =>
      Promise.resolve({ ...mockBackupDataEntity, id })
    ),

  findAndCount: jest
    .fn()
    .mockImplementation(() => Promise.resolve([[mockBackupDataEntity], 1])),
};

describe('BackupDataController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<BackupDataEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BackupDataModule],
    })
      .overrideProvider(getRepositoryToken(BackupDataEntity))
      .useValue(mockBackupDataRepository)
      .compile();

    repository = module.get(getRepositoryToken(BackupDataEntity));

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/backupData (POST) should create new backup data entry', async () => {
    const createBackupDataDto: CreateBackupDataDto = {
      id: '1',
      sizeMB: 100,
      creationDate: new Date(),
    };

    const response = await request(app.getHttpServer())
      .post('/backupData')
      .send(createBackupDataDto)
      .expect(201);

    expect(response.body).toEqual({
      id: createBackupDataDto.id,
      sizeMB: createBackupDataDto.sizeMB,
      creationDate: createBackupDataDto.creationDate.toISOString(),
    });

    expect(mockBackupDataRepository.save).toBeCalledWith({
      ...createBackupDataDto,
      creationDate: createBackupDataDto.creationDate.toISOString(),
    });
  });
  it('/backupData/:id (GET) should return a backup data entry by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/backupData/${mockBackupDataEntity.id}`)
      .expect(200);

    expect(response.body).toEqual({
      ...mockBackupDataEntity,
      creationDate: mockBackupDataEntity.creationDate.toISOString(),
    });

    expect(mockBackupDataRepository.findOne).toBeCalledWith({
      where: { id: mockBackupDataEntity.id },
    });
  });

  it('/backupData (GET) with pagination should return paginated backup data entries', async () => {
    const response = await request(app.getHttpServer())
      .get('/backupData?offset=0&limit=1')
      .expect(200);

    expect(response.body).toEqual({
      data: [
        {
          ...mockBackupDataEntity,
          creationDate: mockBackupDataEntity.creationDate.toISOString(),
        },
      ],
      paginationData: {
        limit: '1',
        offset: '0',
        total: 1,
      },
    });

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      skip: '0',
      take: '1',
      order: { creationDate: 'DESC' },
      where: { type: BackupType.FULL },
    });
  });

  it('/backupData (GET) with date range should return backup data entries within date range', async () => {
    const response = await request(app.getHttpServer())
      .get('/backupData?fromDate=2023-12-01&toDate=2023-12-31')
      .expect(200);

    expect(response.body).toEqual({
      data: [
        {
          ...mockBackupDataEntity,
          creationDate: mockBackupDataEntity.creationDate.toISOString(),
        },
      ],
      paginationData: {
        total: 1,
      },
    });

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: { creationDate: expect.any(Object), type: BackupType.FULL },
    });
  });
  it('/backupData (GET) with taskId should return backup data entries with the specified taskId', async () => {
    await request(app.getHttpServer())
      .get('/backupData?taskId=task-123')
      .expect(200);

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: { taskId: { id: 'task-123' }, type: BackupType.FULL },
    });
  });

  it('/backupData (GET) with taskName should return backup data entries with the specified taskName', async () => {
    await request(app.getHttpServer())
      .get('/backupData?taskName=backup-task')
      .expect(200);

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: {
        taskId: { displayName: ILike('%backup-task%') },
        type: BackupType.FULL,
      },
    });
  });
});
