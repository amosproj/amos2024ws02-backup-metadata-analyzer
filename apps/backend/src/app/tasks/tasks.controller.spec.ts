import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskEntity } from './entity/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/createTask.dto';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<TaskEntity>;

  const mockTaskRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(TaskEntity),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    repository = moduleFixture.get<Repository<TaskEntity>>(
      getRepositoryToken(TaskEntity)
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/tasks (GET) should return an array of tasks', async () => {
    const result = [new TaskEntity()];
    jest.spyOn(repository, 'find').mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);

    expect(response.body).toEqual(result);
  });

  it('/tasks/:id (GET) should return a task if found', async () => {
    const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';
    const task = new TaskEntity();
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(task);

    const response = await request(app.getHttpServer())
      .get(`/tasks/${id}`)
      .expect(200);

    expect(response.body).toEqual(task);
  });

  it('/tasks (POST) should create and return a task', async () => {
    const createTaskDto: CreateTaskDto = {
      id: 'someId',
      displayName: 'someName',
    };
    const task = new TaskEntity();
    jest.spyOn(repository, 'save').mockResolvedValue(task);

    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send(createTaskDto)
      .expect(201);

    expect(response.body).toEqual(task);
  });

  it('/tasks/batched (POST) should create and return multiple tasks', async () => {
    const createTaskDtos: CreateTaskDto[] = [
      { id: 'id1', displayName: 'name1' },
      { id: 'id2', displayName: 'name2' },
    ];

    await request(app.getHttpServer())
      .post('/tasks/batched')
      .send(createTaskDtos)
      .expect(201);

    expect(repository.save).toHaveBeenCalledWith(createTaskDtos);
  });
});
