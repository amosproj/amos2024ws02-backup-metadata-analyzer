import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataStoreEntity } from './entity/dataStore.entity';
import { DataStoresController } from './dataStores.controller';
import { DataStoresService } from './dataStores.service';
import { CreateDataStoreDto } from './dto/createDataStore.dto';

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
});
