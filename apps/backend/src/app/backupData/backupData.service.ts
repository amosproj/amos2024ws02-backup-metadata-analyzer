import {Injectable,} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BackupDataEntity} from "./entity/backupData.entity";
import {CreateBackupDataDto} from "./dto/createBackupData.dto";
import {PaginationOptionsDto} from "../utils/pagination/PaginationOptionsDto";
import {PaginationDto} from "../utils/pagination/PaginationDto";
import {PaginationService} from "../utils/pagination/paginationService";
import {BackupDataDto} from "./dto/backupData.dto";

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
    async findAll(paginationOptionsDto: PaginationOptionsDto): Promise<PaginationDto<BackupDataDto>> {
        return await this.paginate(this.backupDataRepository, paginationOptionsDto, {}) as PaginationDto<BackupDataDto>;
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
}
