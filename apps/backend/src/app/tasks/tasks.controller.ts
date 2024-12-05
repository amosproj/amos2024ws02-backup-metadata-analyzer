import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksController: TasksController) {}
}
