import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { DemoEntity } from './demo/entity/demo.entity';
import { Init1730126846408 } from './migrations/1730126846408-Init';
import { BackupDataEntity } from './backupData/entity/backupData.entity';
import { AddBackupDataTable1730491370687 } from './migrations/1730491370687-AddBackupDataTable';
import { RemovedBio1731662089990 } from './migrations/1731662089990-RemovedBio';
import { AlertEntity } from './alerting/entity/alert.entity';
import { Alert1732390760114 } from './migrations/1732390760114-Alert';
import { ChangedSizeToDecimal1732720032144 } from './migrations/1732720032144-ChangedSizeToDecimal';
import { BackupType1732720927342 } from './migrations/1732720927342-BackupType';
import { COPYBackupType1732873335062 } from './migrations/1732873335062-COPYBackupType';

/**
 * Used by NestJS to reach database.
 */
@Injectable()
export class DbConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(ConfigService)
    private configService: ConfigService
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions & DataSourceOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow<string>('DATABASE_HOST'),
      port: +this.configService.getOrThrow<string>('DATABASE_PORT'),
      username: this.configService.getOrThrow<string>('DATABASE_USER'),
      password: this.configService.getOrThrow<string>('DATABASE_PASSWORD'),
      database: this.configService.getOrThrow<string>('DATABASE_DATABASE'),
      entities: [DemoEntity, BackupDataEntity, AlertEntity],
      migrationsRun: true,
      migrations: [
        Init1730126846408,
        AddBackupDataTable1730491370687,
        RemovedBio1731662089990,
        Alert1732390760114,
        ChangedSizeToDecimal1732720032144,
        BackupType1732720927342,
        COPYBackupType1732873335062,
      ],
      logging: true,
    };
  }
}
