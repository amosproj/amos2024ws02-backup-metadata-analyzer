import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupAlertsOverviewController } from './backupAlertsOverview.controller';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { SizeAlertEntity } from '../alerting/entity/alerts/sizeAlert.entity';
import { AlertTypeEntity } from '../alerting/entity/alertType.entity';
import { CreationDateAlertEntity } from '../alerting/entity/alerts/creationDateAlert.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';
import { BackupAlertsOverviewEntity } from './entity/backupAlertsOverview.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BackupDataEntity,
      SizeAlertEntity,
      AlertTypeEntity,
      CreationDateAlertEntity,
      BackupAlertsOverviewDto,
      BackupAlertsOverviewEntity,
    ]),
  ],
  controllers: [BackupAlertsOverviewController],
  providers: [BackupAlertsOverviewService],
})
export class BackupAlertsOverviewModule {}
