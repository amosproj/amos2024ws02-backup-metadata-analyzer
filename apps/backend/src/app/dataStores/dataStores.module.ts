import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStoreEntity } from './entity/dataStore.entity';
import { DataStoresController } from './dataStores.controller';
import { DataStoresService } from './dataStores.service';

@Module({
  providers: [DataStoresService],
  imports: [TypeOrmModule.forFeature([DataStoreEntity])],
  controllers: [DataStoresController],
  exports: [DataStoresService],
})
export class DataStoresModule {}
