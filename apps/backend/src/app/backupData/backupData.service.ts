import {Injectable,} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BackupDataEntity} from "./entity/backupData.entity";
import {CreateBackupDataDto} from "./dto/createBackupData.dto";

@Injectable()
export class BackupDataService {
    constructor(
        @InjectRepository(BackupDataEntity)
        private backupDataRepository: Repository<BackupDataEntity>,
    ) {
    }

    /**
     * Find one Backup by id.
     * @param id
     */
    async findOneById(id: string): Promise<BackupDataEntity | null> {
        return this.backupDataRepository.findOne({where: {id: id}});
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
