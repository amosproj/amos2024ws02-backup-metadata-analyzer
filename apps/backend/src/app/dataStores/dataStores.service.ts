import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataStoreEntity } from './entity/dataStore.entity';

@Injectable()
export class DataStoresService {
  constructor(
    @InjectRepository(DataStoreEntity)
    private readonly dataStoreEntityRepository: Repository<DataStoreEntity>
  ) {}

  async findAll(): Promise<DataStoreEntity[]> {
    return this.dataStoreEntityRepository.find();
  }

  async findOne(id: string): Promise<DataStoreEntity | null> {
    return await this.dataStoreEntityRepository.findOneBy({ id });
  }

  async create(dataStoreEntity: DataStoreEntity): Promise<DataStoreEntity> {
    return this.dataStoreEntityRepository.save(dataStoreEntity);
  }

  async setOverflowTime(
    id: string,
    overflowTime: number
  ): Promise<DataStoreEntity> {
    if (overflowTime < 0) {
      throw new Error('Overflow time must be a positive number or 0.');
    }

    const dataStore = await this.dataStoreEntityRepository.findOne({
      where: { id },
    });

    if (!dataStore) {
      throw new Error(`DataStore with id ${id} not found`);
    }

    dataStore.overflowTime = overflowTime;
    return await this.dataStoreEntityRepository.save(dataStore);
  }
}
