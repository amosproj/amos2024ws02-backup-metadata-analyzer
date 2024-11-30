import { Module } from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { MailModule } from '../utils/mail/mail.module';
import { AlertingController } from './alerting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupDataModule } from '../backupData/backupData.module';
import { AlertTypeEntity } from './entity/alertType.entity';
import { SizeAlertEntity } from './entity/alerts/sizeAlert.entity';
import { CreationDateEntity } from './entity/alerts/creationDate.entity';

@Module({
  imports: [
    MailModule,
    BackupDataModule,
    TypeOrmModule.forFeature([
      AlertTypeEntity,
      SizeAlertEntity,
      CreationDateEntity,
    ]),
  ],
  providers: [AlertingService],
  controllers: [AlertingController],
})
export class AlertingModule {}
