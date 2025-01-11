import { Module } from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { MailModule } from '../utils/mail/mail.module';
import { AlertingController } from './alerting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupDataModule } from '../backupData/backupData.module';
import { AlertTypeEntity } from './entity/alertType.entity';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { CreationDateAlertEntity } from './entity/alerts/creationDateAlert.entity';
import { StorageFillAlertEntity } from './entity/alerts/storageFillAlert.entity';
import { MissingBackupAlertEntity } from './entity/alerts/missingBackupAlert.entity';

@Module({
  imports: [
    MailModule,
    BackupDataModule,
    TypeOrmModule.forFeature([
      AlertTypeEntity,
      SizeAlertEntity,
      CreationDateAlertEntity,
      StorageFillAlertEntity,
      MissingBackupAlertEntity,
    ]),
  ],
  providers: [AlertingService],
  controllers: [AlertingController],
})
export class AlertingModule {}
