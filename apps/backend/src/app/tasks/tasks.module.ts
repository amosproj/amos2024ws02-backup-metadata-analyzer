import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entity/task.entity';

@Module({
  providers: [TasksService],
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
