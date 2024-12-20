import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailReceiverEntity } from './entity/MailReceiver.entity';
import { MailController } from './mail.controller';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('MAIL_HOST'),
          port: config.getOrThrow('MAIL_PORT'),
          secure: true,
          auth: {
            user: config.getOrThrow('MAIL_USER'),
            pass: config.getOrThrow('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"Metadata Mavericks Alerting Service" <${config.getOrThrow(
            'MAIL_FROM'
          )}>`,
        },
        template: {
          dir: join('apps/backend/src/app/utils/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([MailReceiverEntity]),
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
