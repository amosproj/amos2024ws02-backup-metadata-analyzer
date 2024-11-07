import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BackupDataService} from "./backupData.service";
import {BackupDataController} from "./backupData.controller";
import {BackupDataEntity} from "./entity/backupData.entity";

@Module({
    providers: [BackupDataService],
    imports: [
        TypeOrmModule.forFeature([BackupDataEntity]),
    ],
    controllers: [BackupDataController],
    exports: [BackupDataService],
})
export class BackupDataModule {
}