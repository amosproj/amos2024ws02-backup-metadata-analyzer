import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConfigService } from './db-config.service';
import { DemoModule } from './demo/demo.module';
import { BackupDataModule } from './backupData/backupData.module';
import { AlertingModule } from './alerting/alerting.module';
import { TasksModule } from './tasks/tasks.module';
import { DataStoresModule } from './dataStores/dataStores.module';
import { InformationModule } from './information/information.module';
import { BackupAlertsOverviewModule } from './backupAlertsOverview/backupAlertsOverview.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DbConfigService,
    }),
    DemoModule,
    BackupDataModule,
    AlertingModule,
    TasksModule,
    DataStoresModule,
    InformationModule,
    BackupAlertsOverviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
