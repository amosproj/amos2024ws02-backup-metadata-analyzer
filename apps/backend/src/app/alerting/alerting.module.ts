import { Module } from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { MailModule } from '../utils/mail/mail.module';
import { AlertingController } from './alerting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupDataModule } from '../backupData/backupData.module';
import { AlertTypeEntity } from './entity/alertType.entity';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { CreationDateAlertEntity } from './entity/alerts/creationDateAlert.entity';

@Module({
  imports: [
    MailModule,
    BackupDataModule,
    TypeOrmModule.forFeature([
      AlertTypeEntity,
      SizeAlertEntity,
      CreationDateAlertEntity,
    ]),
  ],
  providers: [AlertingService],
  controllers: [AlertingController],
})
export class AlertingModule {}
