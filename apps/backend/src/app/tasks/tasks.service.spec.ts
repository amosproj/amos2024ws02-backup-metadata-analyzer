import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { TaskEntity } from './entity/task.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<TaskEntity>;

  const mockTaskRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(TaskEntity),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<TaskEntity>>(
      getRepositoryToken(TaskEntity)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = [new TaskEntity()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a task if found', async () => {
      const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';
      const task = new TaskEntity();
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(task);

      expect(await service.findOne(id)).toBe(task);
    });

    it('should throw a NotFoundException if task not found', async () => {
      const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18d';
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      const task = new TaskEntity();
      jest.spyOn(repository, 'save').mockResolvedValue(task);

      expect(await service.create(task)).toBe(task);
    });
  });
});
