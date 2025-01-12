import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataStoreEntity } from './entity/dataStore.entity';
import { DataStoresController } from './dataStores.controller';
import { DataStoresService } from './dataStores.service';
import { CreateDataStoreDto } from './dto/createDataStore.dto';
import { plainToInstance } from 'class-transformer';
import { SetOverflowTimeDto } from './dto/setOverflowTime.dto';

describe('DataStoresController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<DataStoreEntity>;

  const mockDataStoresRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DataStoresController],
      providers: [
        DataStoresService,
        {
          provide: getRepositoryToken(DataStoreEntity),
          useValue: mockDataStoresRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    repository = moduleFixture.get<Repository<DataStoreEntity>>(
      getRepositoryToken(DataStoreEntity)
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/dataStores (GET) should return an array of data stores', async () => {
    const result = [new DataStoreEntity()];
    jest.spyOn(repository, 'find').mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/dataStores')
      .expect(200);

    expect(response.body).toEqual(result);
  });

  it('/dataStores/:id (GET) should return a data stores if found', async () => {
    const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';
    const dataStoreEntity = new DataStoreEntity();
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(dataStoreEntity);

    const response = await request(app.getHttpServer())
      .get(`/dataStores/${id}`)
      .expect(200);

    expect(response.body).toEqual(dataStoreEntity);
  });

  it('/dataStores (POST) should create and return a data stores', async () => {
    const createDataStoreDto: CreateDataStoreDto = {
      id: 'someId',
      displayName: 'someName',
      capacity: 100,
      highWaterMark: 80,
      filled: 20,
    };
    const dataStoreEntity = new DataStoreEntity();
    jest.spyOn(repository, 'save').mockResolvedValue(dataStoreEntity);

    const response = await request(app.getHttpServer())
      .post('/dataStores')
      .send(createDataStoreDto)
      .expect(201);

    expect(response.body).toEqual(dataStoreEntity);
  });

  it('/dataStores (POST) should create and return data store', async () => {
    const createDataStoreDto: CreateDataStoreDto = {
      id: 'someId',
      displayName: 'someName',
      capacity: 100,
      highWaterMark: 80,
      filled: 20,
    };
    await request(app.getHttpServer())
      .post('/dataStores')
      .send(createDataStoreDto)
      .expect(201);

    expect(repository.save).toHaveBeenCalledWith(createDataStoreDto);
  });

  it('/dataStores (POST) should create and return data store', async () => {
    const createDataStoreDto: CreateDataStoreDto = {
      id: 'someId',
      displayName: 'someName',
      capacity: 100,
      highWaterMark: 80,
      filled: 20,
    };
    await request(app.getHttpServer())
      .post('/dataStores')
      .send(createDataStoreDto)
      .expect(201);

    expect(repository.save).toHaveBeenCalledWith(createDataStoreDto);
  });

  it('/dataStores/:id/OverflowTime (POST) should update overflowTime from 14 to 28', async () => {
    const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';

    const initialDataStore = plainToInstance(CreateDataStoreDto, {
      id: 'ea1a2f52-5cf4-44a6-b266-175ee396a18c',
      displayName: 'someName',
      capacity: 100,
      highWaterMark: 80,
      filled: 20,
      overflowTime: 14,
    });

    const updatedOverflowTimeDto = {
      overflowTime: 28,
    };

    const updatedDataStore = {
      ...initialDataStore,
      overflowTime: updatedOverflowTimeDto.overflowTime,
    };

    jest.spyOn(repository, 'findOneBy').mockResolvedValue(initialDataStore);
    jest.spyOn(repository, 'save').mockResolvedValue(updatedDataStore);

    const response = await request(app.getHttpServer())
      .post(`/dataStores/${id}/setOverflowTime`)
      .send(updatedOverflowTimeDto)
      .expect(200);

    expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    expect(repository.save).toHaveBeenCalledWith({
      ...initialDataStore,
      overflowTime: updatedOverflowTimeDto.overflowTime,
    });

    expect(response.body).toEqual(updatedDataStore);
  });

  it('/dataStores/:id/OverflowTime (POST) should update overflowTime from 14 to 0', async () => {
    const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';

    const initialDataStore = plainToInstance(CreateDataStoreDto, {
      id: 'ea1a2f52-5cf4-44a6-b266-175ee396a18c',
      displayName: 'someName',
      capacity: 100,
      highWaterMark: 80,
      filled: 20,
      overflowTime: 14,
    });

    const updatedOverflowTimeDto = {
      overflowTime: 0,
    };

    const updatedDataStore = {
      ...initialDataStore,
      overflowTime: updatedOverflowTimeDto.overflowTime,
    };

    jest.spyOn(repository, 'findOneBy').mockResolvedValue(initialDataStore);
    jest.spyOn(repository, 'save').mockResolvedValue(updatedDataStore);

    const response = await request(app.getHttpServer())
      .post(`/dataStores/${id}/OverflowTime`)
      .send(updatedOverflowTimeDto)
      .expect(200);

    expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    expect(repository.save).toHaveBeenCalledWith({
      ...initialDataStore,
      overflowTime: updatedOverflowTimeDto.overflowTime,
    });

    expect(response.body).toEqual(updatedDataStore);
  });

  it('/dataStores/:id/OverflowTime (POST) should fail to update overflowTime from 14 to -1', async () => {
    jest.clearAllMocks();

    const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';

    const initialDataStore = plainToInstance(CreateDataStoreDto, {
      id: 'ea1a2f52-5cf4-44a6-b266-175ee396a18c',
      displayName: 'someName',
      capacity: 100,
      highWaterMark: 80,
      filled: 20,
      overflowTime: 14,
    });

    const invalidOverflowTimeDto = {
      overflowTime: -1,
    };

    jest.spyOn(repository, 'findOneBy').mockResolvedValue(initialDataStore);

    const saveSpy = jest
      .spyOn(repository, 'save')
      .mockResolvedValue(initialDataStore);

    const response = await request(app.getHttpServer())
      .post(`/dataStores/${id}/OverflowTime`)
      .send(invalidOverflowTimeDto)
      .expect(400);
    expect(saveSpy).not.toHaveBeenCalled();

    expect(response.body.message).toContain(
      'Overflow time must be a positive number or 0.'
    );
  });
});
