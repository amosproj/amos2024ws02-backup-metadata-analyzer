import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BackupDataEntity } from './entity/backupData.entity';
import { CreateBackupDataDto } from './dto/createBackupData.dto';
import { PaginationOptionsDto } from '../utils/pagination/PaginationOptionsDto';
import { PaginationDto } from '../utils/pagination/PaginationDto';
import { PaginationService } from '../utils/pagination/paginationService';
import { BackupDataDto } from './dto/backupData.dto';
import { BackupDataFilterDto } from './dto/backupDataFilter.dto';
import { BackupDataOrderOptionsDto } from './dto/backupDataOrderOptions.dto';

@Injectable()
export class BackupDataService extends PaginationService {
  constructor(
    @InjectRepository(BackupDataEntity)
    private backupDataRepository: Repository<BackupDataEntity>
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
    backupDataFilterDto: BackupDataFilterDto
  ): Promise<PaginationDto<BackupDataDto>> {
    return await this.paginate<BackupDataEntity>(
      this.backupDataRepository,
      this.createOrderClause(backupDataOrderOptionsDto),
      this.createWhereClause(backupDataFilterDto),
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
    return await this.backupDataRepository.save({
      ...createBackupDataDto,
      size: Math.floor(createBackupDataDto.size),
    });
  }

  /**
   * Create new backup data entities batched.
   * @param createBackupDataDtos
   */
  async createBatched(
    createBackupDataDtos: CreateBackupDataDto[]
  ): Promise<void> {
    await this.backupDataRepository.save(
      createBackupDataDtos.map((dto) => ({
        ...dto,
        size: Math.floor(dto.size),
      }))
    );
  }

  /**
   * Create where clause.
   * @param backupDataFilterDto
   */
  createWhereClause(backupDataFilterDto: BackupDataFilterDto) {
    let where: any = {};

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
      console.log(from);
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
      console.log(to);
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
    if (backupDataFilterDto.fromSize && backupDataFilterDto.toSize) {
      where.size = Between(
        backupDataFilterDto.fromSize,
        backupDataFilterDto.toSize
      );
    } else if (backupDataFilterDto.fromSize) {
      where.size = MoreThanOrEqual(backupDataFilterDto.fromSize);
    } else if (backupDataFilterDto.toSize) {
      where.size = LessThanOrEqual(backupDataFilterDto.toSize);
    }

    return where;
  }

  /**
   * Create order clause.
   * @param backupDataOrderOptionsDto
   */
  createOrderClause(backupDataOrderOptionsDto: BackupDataOrderOptionsDto) {
    return {
      [backupDataOrderOptionsDto.orderBy ?? 'creationDate']:
        backupDataOrderOptionsDto.sortOrder ?? 'DESC',
    };
  }
}
