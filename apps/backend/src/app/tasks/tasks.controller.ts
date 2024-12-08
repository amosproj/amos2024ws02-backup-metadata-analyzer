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

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Returns all tasks.' })
  @ApiOkResponse()
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns the task with the given id.' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creates a new task.' })
  @ApiCreatedResponse()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Post('batched')
  @ApiOperation({ summary: 'Creates multiple tasks batched.' })
  @ApiCreatedResponse()
  async createBatched(@Body() createTaskDtos: CreateTaskDto[]) {
    return this.tasksService.createBatched(createTaskDtos);
  }
}
