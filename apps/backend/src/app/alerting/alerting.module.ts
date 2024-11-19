import { Module } from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { MailModule } from '../utils/mail/mail.module';
import { AlertingController } from './alerting.controller';

@Module({
  imports: [MailModule],
  providers: [AlertingService],
  controllers: [AlertingController],
})
export class AlertingModule {}
