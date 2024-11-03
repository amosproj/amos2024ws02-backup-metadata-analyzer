import {BadRequestException, Injectable,} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Between, ILike, LessThanOrEqual, MoreThanOrEqual, Repository} from "typeorm";
import {BackupDataEntity} from "./entity/backupData.entity";
import {CreateBackupDataDto} from "./dto/createBackupData.dto";
import {PaginationOptionsDto} from "../utils/pagination/PaginationOptionsDto";
import {PaginationDto} from "../utils/pagination/PaginationDto";
import {PaginationService} from "../utils/pagination/paginationService";
import {BackupDataDto} from "./dto/backupData.dto";
import {BackupDataFilterDto} from "./dto/backupDataFilter.dto";
import {BackupDataOrderOptionsDto} from "./dto/backupDataOrderOptions.dto";

@Injectable()
export class BackupDataService extends PaginationService {
    constructor(
        @InjectRepository(BackupDataEntity)
        private backupDataRepository: Repository<BackupDataEntity>,
    ) {
        super();
    }

    /**
     * Find one Backup by id.
     * @param id
     */
    async findOneById(id: string): Promise<BackupDataEntity | null> {
        return this.backupDataRepository.findOne({where: {id: id}});
    }

    /**
     * Find all backups with pagination.
     */
    async findAll(paginationOptionsDto: PaginationOptionsDto, backupDataOrderOptionsDto: BackupDataOrderOptionsDto, backupDataFilterDto: BackupDataFilterDto): Promise<PaginationDto<BackupDataDto>> {
        return await this.paginate<BackupDataEntity>(this.backupDataRepository, this.createOrderClause(backupDataOrderOptionsDto), this.createWhereClause(backupDataFilterDto), paginationOptionsDto);
    }

    /**
     * Create a new backup data entity.
     * @param createBackupDataDto
     */
    async create(createBackupDataDto: CreateBackupDataDto): Promise<BackupDataEntity> {
        const backupDataEntity = new BackupDataEntity();
        Object.assign(backupDataEntity, createBackupDataDto);

        return this.backupDataRepository.save(backupDataEntity);
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
        }
        if (backupDataFilterDto.toDate) {
            to = new Date(backupDataFilterDto.toDate);
            if (Number.isNaN(to.getTime())) {
                throw new BadRequestException('parameter toDate is not a valid date');
            }
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
            where.sizeMB = Between(backupDataFilterDto.fromSizeMB, backupDataFilterDto.toSizeMB);
        } else if (backupDataFilterDto.fromSizeMB) {
            where.sizeMB = MoreThanOrEqual(backupDataFilterDto.fromSizeMB);
        } else if (backupDataFilterDto.toSizeMB) {
            where.sizeMB = LessThanOrEqual(backupDataFilterDto.toSizeMB);
        }

        // Bio search
        if (backupDataFilterDto.bio) {
            where.bio = ILike(`%${backupDataFilterDto.bio}%`);
        }
        return where;
    }

    /**
     * Create order clause.
     * @param backupDataOrderOptionsDto
     */
    createOrderClause(backupDataOrderOptionsDto: BackupDataOrderOptionsDto) {
        return {
            [backupDataOrderOptionsDto.orderBy ?? 'creationDate']: backupDataOrderOptionsDto.sortOrder ?? 'DESC',
        }
    }
}
