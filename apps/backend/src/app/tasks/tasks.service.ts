import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './entity/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>
  ) {}

  async findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.find();
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async create(task: TaskEntity): Promise<TaskEntity> {
    return this.taskRepository.save(task);
  }

  async createBatched(tasks: TaskEntity[]): Promise<void> {
    await this.taskRepository.save(tasks);
  }
}
