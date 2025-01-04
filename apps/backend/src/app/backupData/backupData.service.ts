import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BackupDataEntity } from './entity/backupData.entity';
import { CreateBackupDataDto } from './dto/createBackupData.dto';
import { PaginationOptionsDto } from '../utils/pagination/PaginationOptionsDto';
import { PaginationDto } from '../utils/pagination/PaginationDto';
import { PaginationService } from '../utils/pagination/paginationService';
import { BackupDataFilterDto } from './dto/backupDataFilter.dto';
import {
  BackupDataOrderByOptions,
  BackupDataOrderOptionsDto,
} from './dto/backupDataOrderOptions.dto';
import { SortOrder } from '../utils/pagination/SortOrder';
import { TasksService } from '../tasks/tasks.service';
import { BackupDataFilterByTaskIdsDto } from './dto/backupDataFilterByTaskIds.dto';
import { TaskEntity } from '../tasks/entity/task.entity';

@Injectable()
export class BackupDataService extends PaginationService {
  constructor(
    @InjectRepository(BackupDataEntity)
    private readonly backupDataRepository: Repository<BackupDataEntity>,
    private readonly tasksService: TasksService
  ) {
    super();
  }

  /**
   * Find one Backup by id.
   * @param id
   */
  async findOneById(id: string): Promise<BackupDataEntity | null> {
    return this.backupDataRepository.findOne({ where: { id: id } });
  }

  /**
   * Find all backups with pagination.
   */
  async findAll(
    paginationOptionsDto: PaginationOptionsDto,
    backupDataOrderOptionsDto: BackupDataOrderOptionsDto,
    backupDataFilterDto: BackupDataFilterDto,
    backupDataFilterByTaskIdsDto?: BackupDataFilterByTaskIdsDto
  ): Promise<PaginationDto<BackupDataEntity>> {
    return await this.paginate<BackupDataEntity>(
      this.backupDataRepository,
      this.createOrderClause(backupDataOrderOptionsDto),
      this.createWhereClause(backupDataFilterDto, backupDataFilterByTaskIdsDto),
      paginationOptionsDto
    );
  }

  /**
   * Create a new backup data entity.
   * @param createBackupDataDto
   */
  async create(
    createBackupDataDto: CreateBackupDataDto
  ): Promise<BackupDataEntity> {
    if (!(await this.tasksService.findOne(createBackupDataDto.taskId ?? ''))) {
      throw new NotFoundException(
        `Task with id ${createBackupDataDto.taskId} not found`
      );
    }

    const entity = Object.assign(new BackupDataEntity(), createBackupDataDto);

    return await this.backupDataRepository.save(entity);
  }

  /**
   * Create new backup data entities batched.
   * @param createBackupDataDtos
   */
  async createBatched(
    createBackupDataDtos: CreateBackupDataDto[]
  ): Promise<void> {
    //ignore unknown taskIds
    for (const dto of createBackupDataDtos) {
      if (dto.taskId && !(await this.tasksService.findOne(dto.taskId))) {
        console.warn(
          `Task with id ${dto.taskId} not found - still creating the backup, but without task`
        );
        dto.taskId = undefined;
      }
    }

    const entities = createBackupDataDtos.map((dto) =>
      Object.assign(new BackupDataEntity(), dto)
    );
    await this.backupDataRepository.save(entities);
  }

  /**
   * Create where clause.
   * @param backupDataFilterDto
   * @param backupDataFilterByTaskIdsDto
   */
  createWhereClause(
    backupDataFilterDto: BackupDataFilterDto,
    backupDataFilterByTaskIdsDto?: BackupDataFilterByTaskIdsDto
  ) {
    const where: FindOptionsWhere<BackupDataEntity> = {};

    //ID search
    if (backupDataFilterDto.id) {
      //like search
      where.id = ILike(`%${backupDataFilterDto.id}%`);
    }

    // Check if params from and to are valid dates

    let from: Date | null = null;
    let to: Date | null = null;
    if (backupDataFilterDto.fromDate) {
      from = new Date(backupDataFilterDto.fromDate);
      if (Number.isNaN(from.getTime())) {
        throw new BadRequestException('parameter fromDate is not a valid date');
      }
      //Set time to first millisecond of the day
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      from.setMilliseconds(0);
    }
    if (backupDataFilterDto.toDate) {
      to = new Date(backupDataFilterDto.toDate);
      if (Number.isNaN(to.getTime())) {
        throw new BadRequestException('parameter toDate is not a valid date');
      }
      //Set time to last millisecond of the day
      to.setHours(0);
      to.setMinutes(0);
      to.setSeconds(0);
      to.setDate(to.getDate() + 1);
      to.setMilliseconds(-1);
    }

    //Creation date search
    if (backupDataFilterDto.fromDate && backupDataFilterDto.toDate) {
      where.creationDate = Between(from!, to!);
    } else if (backupDataFilterDto.fromDate) {
      where.creationDate = MoreThanOrEqual(from!);
    } else if (backupDataFilterDto.toDate) {
      where.creationDate = LessThanOrEqual(to!);
    }

    //Size search
    if (backupDataFilterDto.fromSizeMB && backupDataFilterDto.toSizeMB) {
      where.sizeMB = Between(
        backupDataFilterDto.fromSizeMB,
        backupDataFilterDto.toSizeMB
      );
    } else if (backupDataFilterDto.fromSizeMB) {
      where.sizeMB = MoreThanOrEqual(backupDataFilterDto.fromSizeMB);
    } else if (backupDataFilterDto.toSizeMB) {
      where.sizeMB = LessThanOrEqual(backupDataFilterDto.toSizeMB);
    }

    //Task id search
    if (backupDataFilterDto.taskId) {
      where.taskId = { id: backupDataFilterDto.taskId };
    }

    //Multiple Task ids from body search
    if (backupDataFilterByTaskIdsDto?.taskIds) {
      const taskIdFilter: FindOptionsWhere<TaskEntity>[] = [];
      const taskIds = backupDataFilterByTaskIdsDto.taskIds;
      for (const taskId of taskIds) {
        taskIdFilter.push({ id: taskId });
      }
      where.taskId = taskIdFilter;
    }

    //Task name search
    if (backupDataFilterDto.taskName) {
      where.taskId = {
        displayName: ILike(`%${backupDataFilterDto.taskName}%`),
      };
    }

    //Saveset search
    if (backupDataFilterDto.saveset) {
      where.saveset = ILike(`%${backupDataFilterDto.saveset}%`);
    }

    //Backup type search
    if (backupDataFilterDto.types) {
      const typesArray = Array.isArray(backupDataFilterDto.types)
        ? backupDataFilterDto.types
        : [backupDataFilterDto.types];
      where.type = In(typesArray);
    }

    // Check if params fromScheduledDate and toScheduledDate are valid dates

    let fromScheduledTime: Date | null = null;
    let toScheduledTime: Date | null = null;
    if (backupDataFilterDto.fromScheduledDate) {
      fromScheduledTime = new Date(backupDataFilterDto.fromScheduledDate);
      if (Number.isNaN(fromScheduledTime.getTime())) {
        throw new BadRequestException(
          'parameter fromScheduledTime is not a valid date'
        );
      }
      //Set time to first millisecond of the day
      fromScheduledTime.setHours(0);
      fromScheduledTime.setMinutes(0);
      fromScheduledTime.setSeconds(0);
      fromScheduledTime.setMilliseconds(0);
    }
    if (backupDataFilterDto.toScheduledDate) {
      toScheduledTime = new Date(backupDataFilterDto.toScheduledDate);
      if (Number.isNaN(toScheduledTime.getTime())) {
        throw new BadRequestException(
          'parameter toScheduledTime is not a valid date'
        );
      }
      //Set time to last millisecond of the day
      toScheduledTime.setHours(0);
      toScheduledTime.setMinutes(0);
      toScheduledTime.setSeconds(0);
      toScheduledTime.setDate(toScheduledTime.getDate() + 1);
      toScheduledTime.setMilliseconds(-1);
    }

    //Creation date search
    if (
      backupDataFilterDto.fromScheduledDate &&
      backupDataFilterDto.toScheduledDate
    ) {
      where.scheduledTime = Between(fromScheduledTime!, toScheduledTime!);
    } else if (backupDataFilterDto.fromScheduledDate) {
      where.scheduledTime = MoreThanOrEqual(fromScheduledTime!);
    } else if (backupDataFilterDto.toScheduledDate) {
      where.scheduledTime = LessThanOrEqual(toScheduledTime!);
    }
    return where;
  }

  /**
   * Create order clause.
   * @param backupDataOrderOptionsDto
   */
  createOrderClause(
    backupDataOrderOptionsDto: BackupDataOrderOptionsDto
  ): FindOptionsOrder<BackupDataEntity> {
    if (
      backupDataOrderOptionsDto.orderBy === BackupDataOrderByOptions.TASK_NAME
    ) {
      return {
        taskId: {
          displayName: backupDataOrderOptionsDto.sortOrder ?? SortOrder.DESC,
        },
      };
    }
    return {
      [backupDataOrderOptionsDto.orderBy ?? 'creationDate']:
        backupDataOrderOptionsDto.sortOrder ?? SortOrder.DESC,
    };
  }
}
