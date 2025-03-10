import {
  BadRequestException,
  Injectable,
  Logger,
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
import { BackupInformationDto } from '../information/dto/backupInformation.dto';
import { BackupSizesPerDayDto } from './dto/BackupSizesPerDay.dto';
import { BackupDataSizeRangeDto } from './dto/BackupDataSizeRanges.dto';

const RANGES = [
  { startSize: 0, endSize: 100 },
  { startSize: 100, endSize: 500 },
  { startSize: 500, endSize: 1000 },
  { startSize: 1000, endSize: 5000 },
  { startSize: 5000, endSize: 10000 },
  { startSize: 10000, endSize: 50000 },
  { startSize: 50000, endSize: 100000 },
  { startSize: 100000, endSize: 500000 },
  { startSize: 500000, endSize: 1000000 },
  { startSize: 1000000, endSize: -1 },
];

@Injectable()
export class BackupDataService extends PaginationService {
  readonly logger = new Logger(BackupDataService.name);

  constructor(
    @InjectRepository(BackupDataEntity)
    private readonly backupDataRepository: Repository<BackupDataEntity>,
    private readonly tasksService: TasksService
  ) {
    super();
  }

  async getTotalBackupInformation(): Promise<BackupInformationDto> {
    // Sum the size of all backups
    const totalSize = await this.backupDataRepository
      .createQueryBuilder('backup')
      .select('SUM(backup.sizeMB)', 'total')
      .getRawOne();

    //Get number of all backups
    const numberOfBackups = await this.backupDataRepository
      .createQueryBuilder('backup')
      .select('COUNT(backup.id)', 'total')
      .getRawOne();
    return {
      totalBackupSize: totalSize?.total ?? 0,
      numberOfBackups: numberOfBackups?.total ?? 0,
    };
  }

  /**
   * Find one Backup by id.
   * @param id
   */
  async findOneById(id: string): Promise<BackupDataEntity | null> {
    return this.backupDataRepository.findOne({ where: { id: id } });
  }

  async findLatest(): Promise<BackupDataEntity | null> {
    return this.backupDataRepository.findOne({
      where: {},
      order: { creationDate: 'DESC' },
    });
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

  async getBackupDataSizesPerDay(
    fromDate?: string,
    toDate?: string,
    taskIds?: string[],
    types?: string[]
  ): Promise<BackupSizesPerDayDto[]> {
    //Validate Dates
    const { from, to } = this.transformDates(fromDate, toDate);

    const query = this.backupDataRepository.createQueryBuilder('backup');
    query.select('DATE(backup.creationDate)', 'date');
    query.addSelect('SUM(backup.sizeMB)', 'sizeMB');
    query.groupBy('DATE(backup.creationDate)');

    if (from) {
      query.andWhere('DATE(backup.creationDate) >= :fromDate', {
        fromDate: from,
      });
    }
    if (to) {
      query.andWhere('DATE(backup.creationDate) <= :toDate', {
        toDate: to,
      });
    }

    if (taskIds) {
      query.andWhere('backup.taskId IN (:...taskIds)', { taskIds });
    }

    if (types) {
      const typesArray = Array.isArray(types) ? types : [types];
      query.andWhere('backup.type IN (:...types)', { types: typesArray });
    }

    return query.getRawMany();
  }

  async getBackupDataSizeRanges(
    fromDate?: string,
    toDate?: string,
    taskIds?: string[],
    types?: string[]
  ): Promise<BackupDataSizeRangeDto[]> {
    // Validate Dates
    const { from, to } = this.transformDates(fromDate, toDate);

    const query = this.backupDataRepository.createQueryBuilder('backup');

    // Apply date filters
    if (from) {
      query.andWhere('backup.creationDate >= :fromDate', { fromDate: from });
    }
    if (to) {
      query.andWhere('backup.creationDate <= :toDate', { toDate: to });
    }

    // Apply task ID filters
    if (taskIds) {
      query.andWhere('backup.taskId IN (:...taskIds)', { taskIds });
    }

    // Apply type filters
    if (types) {
      const typesArray = Array.isArray(types) ? types : [types];
      query.andWhere('backup.type IN (:...types)', { types: typesArray });
    }

    // Initialize result array
    const result: BackupDataSizeRangeDto[] = [];

    // Iterate over predefined ranges and count backups in each range
    for (const range of RANGES) {
      const countQuery = query.clone();
      if (range.endSize === -1) {
        countQuery.andWhere('backup.sizeMB >= :startSize', {
          startSize: range.startSize,
        });
      } else {
        countQuery.andWhere(
          'backup.sizeMB >= :startSize AND backup.sizeMB < :endSize',
          {
            startSize: range.startSize,
            endSize: range.endSize,
          }
        );
      }
      const count = await countQuery.getCount();
      result.push({
        startSize: range.startSize,
        endSize: range.endSize,
        count: count,
      });
    }

    return result;
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
    const existingTaskIds = await this.tasksService.findAll().then((tasks) => {
      return tasks.map((task) => task.id);
    });
    //ignore unknown taskIds
    for (const dto of createBackupDataDtos) {
      if (dto.taskId && !existingTaskIds.includes(dto.taskId)) {
        this.logger.debug(
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

    const { from, to } = this.transformDates(
      backupDataFilterDto.fromDate,
      backupDataFilterDto.toDate
    );

    //Creation date search
    if (from && to) {
      where.creationDate = Between(from, to);
    } else if (from) {
      where.creationDate = MoreThanOrEqual(from);
    } else if (to) {
      where.creationDate = LessThanOrEqual(to);
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
    const { from: fromScheduledTime, to: toScheduledTime } =
      this.transformDates(
        backupDataFilterDto.fromScheduledDate,
        backupDataFilterDto.toScheduledDate
      );

    //Creation date search
    if (fromScheduledTime && toScheduledTime) {
      where.scheduledTime = Between(fromScheduledTime, toScheduledTime);
    } else if (fromScheduledTime) {
      where.scheduledTime = MoreThanOrEqual(fromScheduledTime);
    } else if (toScheduledTime) {
      where.scheduledTime = LessThanOrEqual(toScheduledTime);
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

  /**
   * Transform dates to Date objects.
   * Sets fromDate to first millisecond of the day and toDate to last millisecond of the day.
   * @param fromDate
   * @param toDate
   */
  private transformDates(
    fromDate?: string,
    toDate?: string
  ): { from: Date | null; to: Date | null } {
    let from: Date | null = null;
    let to: Date | null = null;
    if (fromDate) {
      from = new Date(fromDate);
      if (Number.isNaN(from.getTime())) {
        throw new BadRequestException('parameter fromDate is not a valid date');
      }
      //Set time to first millisecond of the day
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      from.setMilliseconds(0);
    }
    if (toDate) {
      to = new Date(toDate);
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
    return { from, to };
  }
}
