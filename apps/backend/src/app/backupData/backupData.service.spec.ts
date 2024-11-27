import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { BackupDataService } from './backupData.service';
import { BackupDataEntity } from './entity/backupData.entity';
import { BackupDataFilterDto } from './dto/backupDataFilter.dto';
import { BadRequestException } from '@nestjs/common';
import { CreateBackupDataDto } from './dto/createBackupData.dto';
import { BackupDataOrderByOptions } from './dto/backupDataOrderOptions.dto';
import { SortOrder } from '../utils/pagination/SortOrder';

const mockBackupDataEntity: BackupDataEntity = {
  id: '123e4567-e89b-12d3-a456-426614174062',
  sizeMB: 100,
  creationDate: new Date('2023-12-30 00:00:00.000000'),
};

const mockBackupDataRepository = {
  findAndCount: jest.fn().mockResolvedValue([[mockBackupDataEntity], 1]),
  save: jest.fn().mockResolvedValue(mockBackupDataEntity),
  findOne: jest.fn().mockResolvedValue(mockBackupDataEntity),
};

describe('BackupDataService', () => {
  let service: BackupDataService;
  let repository: Repository<BackupDataEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupDataService,
        {
          provide: getRepositoryToken(BackupDataEntity),
          useValue: mockBackupDataRepository,
        },
      ],
    }).compile();

    service = module.get(BackupDataService);
    repository = module.get(getRepositoryToken(BackupDataEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    it('should return paginated backup data with default sort by createdDate DESC', async () => {
      const result = await service.findAll({ offset: 0, limit: 5 }, {}, {});
      expect(result).toEqual({
        data: [mockBackupDataEntity],
        paginationData: {
          limit: 5,
          offset: 0,
          total: 1,
        },
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        take: 5,
        order: { creationDate: 'DESC' },
        where: {},
      });
    });
  });

  describe('createWhereClause', () => {
    it('should create a where clause for ID search', () => {
      const filterDto: BackupDataFilterDto = { id: '123' };
      const where = service.createWhereClause(filterDto);
      expect(where).toEqual({ id: ILike('%123%') });
    });

    // it('should create a where clause for date range search', () => {
    //   const filterDto: BackupDataFilterDto = {
    //     fromDate: '2023-01-01',
    //     toDate: '2023-12-31',
    //   };
    //   const where = service.createWhereClause(filterDto);
    //   expect(where).toEqual({
    //     creationDate: Between(new Date('2023-01-01'), new Date('2023-12-31')),
    //   });
    // });

    it('should create a where clause for size range search', () => {
      const filterDto: BackupDataFilterDto = { fromSizeMB: 10, toSizeMB: 100 };
      const where = service.createWhereClause(filterDto);
      expect(where).toEqual({ sizeMB: Between(10, 100) });
    });

    // it('should create a where clause for combined filters', () => {
    //   const filterDto: BackupDataFilterDto = {
    //     id: '123',
    //     fromDate: '2023-01-01',
    //     toDate: '2023-12-31',
    //     fromSizeMB: 10,
    //     toSizeMB: 100,
    //   };
    //   const where = service.createWhereClause(filterDto);
    //   expect(where).toEqual({
    //     id: ILike('%123%'),
    //     creationDate: Between(new Date('2023-01-01'), new Date('2023-12-31')),
    //     sizeMB: Between(10, 100),
    //   });
    // });

    it('should throw an error for invalid fromDate', () => {
      const filterDto: BackupDataFilterDto = { fromDate: 'invalid-date' };
      expect(() => service.createWhereClause(filterDto)).toThrow(
        BadRequestException
      );
    });

    it('should throw an error for invalid toDate', () => {
      const filterDto: BackupDataFilterDto = { toDate: 'invalid-date' };
      expect(() => service.createWhereClause(filterDto)).toThrow(
        BadRequestException
      );
    });
  });

  describe('createOrderClause', () => {
    it('should create an order clause for creationDate in DESC order by default', () => {
      const orderClause = service.createOrderClause({});
      expect(orderClause).toEqual({ creationDate: 'DESC' });
    });

    it('should create an order clause for sizeMB in ASC order', () => {
      const orderClause = service.createOrderClause({
        orderBy: BackupDataOrderByOptions.SIZE,
        sortOrder: SortOrder.ASC,
      });
      expect(orderClause).toEqual({ sizeMB: 'ASC' });
    });

    it('should create an order clause for id in ASC order', () => {
      const orderClause = service.createOrderClause({
        orderBy: BackupDataOrderByOptions.ID,
        sortOrder: SortOrder.ASC,
      });
      expect(orderClause).toEqual({ id: 'ASC' });
    });
  });

  describe('create', () => {
    it('should create a new backup data entity', async () => {
      let createBackupDataDto: CreateBackupDataDto = new CreateBackupDataDto();
      Object.assign(createBackupDataDto, mockBackupDataEntity);

      const result = await service.create(createBackupDataDto);
      expect(result).toEqual(mockBackupDataEntity);
      expect(repository.save).toHaveBeenCalledWith(mockBackupDataEntity);
    });
  });

  describe('createBatched', () => {
    it('should create new backup data entities batched', async () => {
      const createBackupDataDtos: CreateBackupDataDto[] = [
        { id: '1', sizeMB: 100, creationDate: new Date() },
        { id: '2', sizeMB: 200, creationDate: new Date() },
      ];

      await service.createBatched(createBackupDataDtos);

      expect(repository.save).toHaveBeenCalledWith(createBackupDataDtos);
    });
  });
  describe('findOneById', () => {
    it('should return a backup data entity by id', async () => {
      const result = await service.findOneById(mockBackupDataEntity.id);
      expect(result).toEqual(mockBackupDataEntity);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockBackupDataEntity.id },
      });
    });
  });
});
