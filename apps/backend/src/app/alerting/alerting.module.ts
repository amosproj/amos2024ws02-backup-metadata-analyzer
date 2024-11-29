import { Module } from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { MailModule } from '../utils/mail/mail.module';
import { AlertingController } from './alerting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertEntity } from './entity/alert.entity';
import { BackupDataModule } from '../backupData/backupData.module';
import { AlertTypeEntity } from './entity/alertType.entity';

@Module({
  imports: [
    MailModule,
    BackupDataModule,
    TypeOrmModule.forFeature([AlertEntity, AlertTypeEntity]),
  ],
  providers: [AlertingService],
  controllers: [AlertingController],
})
export class AlertingModule {}
