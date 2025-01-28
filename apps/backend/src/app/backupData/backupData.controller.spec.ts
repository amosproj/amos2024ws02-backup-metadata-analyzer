import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { BackupDataEntity } from './entity/backupData.entity';
import { CreateBackupDataDto } from './dto/createBackupData.dto';
import { BackupDataModule } from './backupData.module';
import { BackupType } from './dto/backupType';
import { TaskEntity } from '../tasks/entity/task.entity';

const mockBackupDataEntity: BackupDataEntity = {
  id: '123e4567-e89b-12d3-a456-426614174062',
  sizeMB: 100,
  saveset: 'backup-123',
  type: BackupType.FULL,
  creationDate: new Date('2023-12-30 00:00:00.000000'),
  scheduledTime: new Date('2023-06-15 00:00:00.000000'),
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
  createQueryBuilder: jest.fn().mockImplementation(() => {
    return {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          date: '2023-01-01',
          sizeMB: 100,
        },
        {
          date: '2023-01-02',
          sizeMB: 200,
        },
      ]),
    } as any;
  }),
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
      .overrideProvider(getRepositoryToken(TaskEntity))
      .useValue({
        findOneBy: jest.fn().mockResolvedValue(new TaskEntity()),
      })
      .compile();

    repository = module.get<Repository<BackupDataEntity>>(
      getRepositoryToken(BackupDataEntity)
    );

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/backupData (POST) should create new backup data entry', async () => {
    const createBackupDataDto: CreateBackupDataDto = {
      id: '1',
      saveset: 'backup-1',
      sizeMB: 100,
      creationDate: new Date(),
    };

    const response = await request(app.getHttpServer())
      .post('/backupData')
      .send(createBackupDataDto)
      .expect(201);

    expect(response.body).toEqual({
      id: createBackupDataDto.id,
      saveset: createBackupDataDto.saveset,
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
      scheduledTime: mockBackupDataEntity?.scheduledTime?.toISOString(),
    });

    expect(mockBackupDataRepository.findOne).toBeCalledWith({
      where: { id: mockBackupDataEntity.id },
    });
  });

  it('/backupData/filter (POST) with pagination should return paginated backup data entries', async () => {
    const response = await request(app.getHttpServer())
      .post('/backupData/filter?offset=0&limit=1')
      .expect(201);

    expect(response.body).toEqual({
      data: [
        {
          ...mockBackupDataEntity,
          creationDate: mockBackupDataEntity.creationDate.toISOString(),
          scheduledTime: mockBackupDataEntity?.scheduledTime?.toISOString(),
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
      where: {},
    });
  });

  it('/backupData/filter (POST) with date range should return backup data entries within date range', async () => {
    const response = await request(app.getHttpServer())
      .post('/backupData/filter?fromDate=2023-12-01&toDate=2023-12-31')
      .expect(201);

    expect(response.body).toEqual({
      data: [
        {
          ...mockBackupDataEntity,
          creationDate: mockBackupDataEntity.creationDate.toISOString(),
          scheduledTime: mockBackupDataEntity?.scheduledTime?.toISOString(),
        },
      ],
      paginationData: {
        total: 1,
      },
    });

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: { creationDate: expect.any(Object) },
    });
  });
  it('/backupData/filter (POST) with taskId should return backup data entries with the specified taskId', async () => {
    await request(app.getHttpServer())
      .post('/backupData/filter?taskId=task-123')
      .expect(201);

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: { taskId: { id: 'task-123' } },
    });
  });

  it('/backupData/filter (POST) with taskName should return backup data entries with the specified taskName', async () => {
    await request(app.getHttpServer())
      .post('/backupData/filter?taskName=backup-task')
      .expect(201);

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: {
        taskId: { displayName: ILike('%backup-task%') },
      },
    });
  });

  it('/backupData/filter (POST) with type should return backup data entries with the specified type', async () => {
    await request(app.getHttpServer())
      .post('/backupData/filter?types=INCREMENTAL')
      .expect(201);

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: {
        type: In([BackupType.INCREMENTAL]),
      },
    });
  });

  it('/backupData/filter (POST) with multiple taskIds should return backup data entries with the specified taskIds', async () => {
    const response = await request(app.getHttpServer())
      .post('/backupData/filter')
      .send({ taskIds: ['task-1', 'task-2'] })
      .expect(201);

    expect(response.body).toEqual({
      data: [
        {
          ...mockBackupDataEntity,
          creationDate: mockBackupDataEntity.creationDate.toISOString(),
          scheduledTime: mockBackupDataEntity?.scheduledTime?.toISOString(),
        },
      ],
      paginationData: {
        total: 1,
      },
    });

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: {
        taskId: [{ id: 'task-1' }, { id: 'task-2' }],
      },
    });
  });

  it('/backupData/filter (POST) with multiple types should return backup data entries with the specified types', async () => {
    await request(app.getHttpServer())
      .post('/backupData/filter?types=FULL&types=INCREMENTAL')
      .expect(201);

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: {
        type: In([BackupType.FULL, BackupType.INCREMENTAL]),
      },
    });
  });

  it('/backupData/filter (POST) with scheduled date range should return backup data entries within scheduled date range', async () => {
    const response = await request(app.getHttpServer())
      .post(
        '/backupData/filter?fromScheduledDate=2023-01-01&toScheduledDate=2023-12-31'
      )
      .expect(201);

    expect(response.body).toEqual({
      data: [
        {
          ...mockBackupDataEntity,
          creationDate: mockBackupDataEntity.creationDate.toISOString(),
          scheduledTime: mockBackupDataEntity?.scheduledTime?.toISOString(),
        },
      ],
      paginationData: {
        total: 1,
      },
    });

    expect(mockBackupDataRepository.findAndCount).toBeCalledWith({
      order: { creationDate: 'DESC' },
      where: { scheduledTime: expect.any(Object) },
    });
  });

  it('/backupData/sizes/perDay (POST) should return backup data sizes per day', async () => {
    const response = await request(app.getHttpServer())
      .post('/backupData/sizes/perDay')
      .send({
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
        taskIds: ['task-1', 'task-2'],
        types: [BackupType.FULL, BackupType.INCREMENTAL],
      })
      .expect(201);
    const mockResult = [
      { date: '2023-01-01', sizeMB: 100 },
      { date: '2023-01-02', sizeMB: 200 },
    ];

    expect(response.body).toEqual(mockResult);
  });

  it('/backupData/sizes/grouped (POST) should return backup data size ranges', async () => {
    const mockResult = [
      { startSize: 0, endSize: 100, count: 10 },
      { startSize: 100, endSize: 500, count: 20 },
      { startSize: 500, endSize: 1000, count: 30 },
      { startSize: 1000, endSize: 5000, count: 40 },
      { startSize: 5000, endSize: 10000, count: 50 },
      { startSize: 10000, endSize: 50000, count: 60 },
      { startSize: 50000, endSize: 100000, count: 70 },
      { startSize: 100000, endSize: 500000, count: 80 },
      { startSize: 500000, endSize: 1000000, count: 90 },
      { startSize: 1000000, endSize: -1, count: 5 },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => {
      return {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest
          .fn()
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(20)
          .mockResolvedValueOnce(30)
          .mockResolvedValueOnce(40)
          .mockResolvedValueOnce(50)
          .mockResolvedValueOnce(60)
          .mockResolvedValueOnce(70)
          .mockResolvedValueOnce(80)
          .mockResolvedValueOnce(90)
          .mockResolvedValueOnce(5),
        clone: jest.fn().mockReturnThis(),
      } as any;
    });

    const response = await request(app.getHttpServer())
      .post('/backupData/sizes/grouped')
      .send({
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
        taskIds: ['task-1', 'task-2'],
        types: [BackupType.FULL, BackupType.INCREMENTAL],
      })
      .expect(201);

    expect(response.body).toEqual(mockResult);
  });
});
