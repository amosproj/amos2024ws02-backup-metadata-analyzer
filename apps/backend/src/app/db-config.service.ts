import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { Init1730126846408 } from './migrations/1730126846408-Init';
import { BackupDataEntity } from './backupData/entity/backupData.entity';
import { AddBackupDataTable1730491370687 } from './migrations/1730491370687-AddBackupDataTable';
import { RemovedBio1731662089990 } from './migrations/1731662089990-RemovedBio';
import { Alert1732390760114 } from './migrations/1732390760114-Alert';
import { ChangedSizeToDecimal1732720032144 } from './migrations/1732720032144-ChangedSizeToDecimal';
import { BackupType1732720927342 } from './migrations/1732720927342-BackupType';
import { COPYBackupType1732873335062 } from './migrations/1732873335062-COPYBackupType';
import { AlertTypeEntity } from './alerting/entity/alertType.entity';
import { AlertType1732873882256 } from './migrations/1732873882256-AlertType';
import { AlertTypeNameUnique1732874749343 } from './migrations/1732874749343-AlertTypeNameUnique';
import { SizeAlertEntity } from './alerting/entity/alerts/sizeAlert.entity';
import { StorageFillAlertEntity } from './alerting/entity/alerts/storageFillAlert.entity';
import { NewAlertStructure1732887680122 } from './migrations/1732887680122-NewAlertStructure';
import { CreationDateAlertEntity } from './alerting/entity/alerts/creationDateAlert.entity';
import { CreationDateAlert1733070019992 } from './migrations/1733070019992-CreationDateAlert';
import { TaskEntity } from './tasks/entity/task.entity';
import { Tasks1733397652480 } from './migrations/1733397652480-Tasks';
import { MailReceiverEntity } from './utils/mail/entity/MailReceiver.entity';
import { MailReceiver1733580333590 } from './migrations/1733580333590-MailReceiver';
import { AddSaveset1733760846109 } from './migrations/1733760846109-AddSaveset';
import { StorageFillAlert1733739256545 } from './migrations/1733739256545-StorageFillAlert';
import { StorageFillAlertChangedColumns1733765217660 } from './migrations/1733765217660-StorageFillAlertChangedColumns';
import {
  StorageFillAlertChangedColumnsDecimal1733768959317
} from './migrations/1733768959317-StorageFillAlertChangedColumnsDecimal';
import { AddScheduledTimeToBackup1734538152155 } from './migrations/1734538152155-AddScheduledTimeToBackup';
import { DataStoreEntity } from './dataStores/entity/dataStore.entity';
import { DataStores1734616685846 } from './migrations/1734616685846-DataStores';
import { AddAlertCreationDate1736344989806 } from './migrations/1736344989806-AddAlertCreationDate';
import { MissingBackupAlertEntity } from './alerting/entity/alerts/missingBackupAlert.entity';
import { AddAlertMissingBackup1736620579537 } from './migrations/1736620579537-AddAlertMissingBackup';
import { AdditionalBackupAlertEntity } from './alerting/entity/alerts/additionalBackupAlert.entity';
import { AddAlertAdditionalBackup1736630779875 } from './migrations/1736630779875-AddAlertAdditionalBackup';
import { StorageOverflowTime1736550460789 } from './migrations/1736550460789-StorageOverflowTime';
import { DeprecatedFlag1737107214086 } from './migrations/1737107214086-DeprecatedFlag';
import { DeprecatedFlagNewAlerts1737406388351 } from './migrations/1737406388351-DeprecatedFlagNewAlerts';

/**
 * Used by NestJS to reach database.
 */
@Injectable()
export class DbConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions & DataSourceOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow<string>('DATABASE_HOST'),
      port: +this.configService.getOrThrow<string>('DATABASE_PORT'),
      username: this.configService.getOrThrow<string>('DATABASE_USER'),
      password: this.configService.getOrThrow<string>('DATABASE_PASSWORD'),
      database: this.configService.getOrThrow<string>('DATABASE_DATABASE'),
      entities: [
        BackupDataEntity,
        AlertTypeEntity,
        SizeAlertEntity,
        CreationDateAlertEntity,
        StorageFillAlertEntity,
        TaskEntity,
        MailReceiverEntity,
        DataStoreEntity,
        MissingBackupAlertEntity,
        AdditionalBackupAlertEntity,
      ],
      migrationsRun: true,
      migrations: [
        Init1730126846408,
        AddBackupDataTable1730491370687,
        RemovedBio1731662089990,
        Alert1732390760114,
        ChangedSizeToDecimal1732720032144,
        BackupType1732720927342,
        COPYBackupType1732873335062,
        AlertType1732873882256,
        AlertTypeNameUnique1732874749343,
        NewAlertStructure1732887680122,
        CreationDateAlert1733070019992,
        Tasks1733397652480,
        MailReceiver1733580333590,
        AddSaveset1733760846109,
        StorageFillAlert1733739256545,
        StorageFillAlertChangedColumns1733765217660,
        StorageFillAlertChangedColumnsDecimal1733768959317,
        AddScheduledTimeToBackup1734538152155,
        DataStores1734616685846,
        AddAlertCreationDate1736344989806,
        AddAlertMissingBackup1736620579537,
        AddAlertAdditionalBackup1736630779875,
        StorageOverflowTime1736550460789,
        DeprecatedFlag1737107214086,
        DeprecatedFlagNewAlerts1737406388351,
      ],
      logging: true,
      logger: 'debug',
    };
  }
}
