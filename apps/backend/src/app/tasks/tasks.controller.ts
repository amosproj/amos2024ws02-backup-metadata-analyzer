import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/createTask.dto';
import { TaskEntity } from './entity/task.entity';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Returns all tasks.' })
  @ApiOkResponse({
    description: 'All tasks.',
    type: CreateTaskDto,
    isArray: true,
  })
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns the task with the given id.' })
  @ApiOkResponse({
    description: 'The task with the given id.',
    type: TaskEntity,
  })
  @ApiNotFoundResponse({
    description: 'Task with given id not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creates a new task.' })
  @ApiCreatedResponse({
    description: 'Task created successfully.',
    type: TaskEntity,
  })
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Post('batched')
  @ApiOperation({ summary: 'Creates multiple tasks batched.' })
  @ApiCreatedResponse({
    description: 'Tasks created successfully.',
  })
  async createBatched(@Body() createTaskDtos: CreateTaskDto[]) {
    return this.tasksService.createBatched(createTaskDtos);
  }
}
