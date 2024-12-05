import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  providers: [TasksService],
  imports: [],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
