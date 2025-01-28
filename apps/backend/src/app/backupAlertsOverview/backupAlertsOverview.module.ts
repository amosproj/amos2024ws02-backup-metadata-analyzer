import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupAlertsOverviewController } from './backupAlertsOverview.controller';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

@Module({
  imports: [
    TypeOrmModule.forFeature([BackupDataEntity, BackupAlertsOverviewDto]),
  ],
  controllers: [BackupAlertsOverviewController],
  providers: [BackupAlertsOverviewService],
})
export class BackupAlertsOverviewModule {}
