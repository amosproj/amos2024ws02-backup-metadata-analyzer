import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupDataService } from './backupData.service';
import { BackupDataController } from './backupData.controller';
import { BackupDataEntity } from './entity/backupData.entity';
import { TasksService } from '../tasks/tasks.service';
import { TaskEntity } from '../tasks/entity/task.entity';

@Module({
  providers: [BackupDataService, TasksService],
  imports: [TypeOrmModule.forFeature([BackupDataEntity, TaskEntity])],
  controllers: [BackupDataController],
  exports: [BackupDataService],
})
export class BackupDataModule {}
