import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataStoresService } from './dataStores.service';
import { DataStoreEntity } from './entity/dataStore.entity';

describe('DataStoresService', () => {
  let service: DataStoresService;
  let repository: Repository<DataStoreEntity>;

  const mockDataStoresRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataStoresService,
        {
          provide: getRepositoryToken(DataStoreEntity),
          useValue: mockDataStoresRepository,
        },
      ],
    }).compile();

    service = module.get<DataStoresService>(DataStoresService);
    repository = module.get<Repository<DataStoreEntity>>(
      getRepositoryToken(DataStoreEntity)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of data stores', async () => {
      const result = [new DataStoreEntity()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a data store if found', async () => {
      const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';
      const dataStoreEntity = new DataStoreEntity();
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(dataStoreEntity);

      expect(await service.findOne(id)).toBe(dataStoreEntity);
    });
  });

  describe('create', () => {
    it('should create and return a data store', async () => {
      const dataStoreEntity = new DataStoreEntity();
      jest.spyOn(repository, 'save').mockResolvedValue(dataStoreEntity);

      expect(await service.create(dataStoreEntity)).toBe(dataStoreEntity);
    });
  });
});
