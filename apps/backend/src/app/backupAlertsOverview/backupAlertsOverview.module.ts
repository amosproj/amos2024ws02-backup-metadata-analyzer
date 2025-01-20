import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupAlertsOverviewController } from './backupAlertsOverview.controller';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';
import { BackupAlertsOverviewEntity } from './entity/backupAlertsOverview.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BackupDataEntity,
      BackupAlertsOverviewDto,
      BackupAlertsOverviewEntity,
    ]),
  ],
  controllers: [BackupAlertsOverviewController],
  providers: [BackupAlertsOverviewService],
})
export class BackupAlertsOverviewModule {}
