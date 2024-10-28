import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {DataSourceOptions} from 'typeorm';
import {DemoEntity} from "./demo/entity/demo.entity";
import {Init1730126846408} from "./migrations/1730126846408-Init";

/**
 * Used by NestJS to reach database.
 */
@Injectable()
export class DbConfigService implements TypeOrmOptionsFactory {
    constructor(
        @Inject(ConfigService)
        private configService: ConfigService) {
    }

    createTypeOrmOptions(): TypeOrmModuleOptions & DataSourceOptions {
        return {
            type: 'postgres',
            host: this.configService.getOrThrow<string>('DATABASE_HOST'),
            port: +this.configService.getOrThrow<string>('DATABASE_PORT'),
            username: this.configService.getOrThrow<string>('DATABASE_USER'),
            password: this.configService.getOrThrow<string>('DATABASE_PASSWORD'),
            database: this.configService.getOrThrow<string>('DATABASE_DATABASE'),
            entities: [DemoEntity],
            migrationsRun: true,
            migrations: [Init1730126846408],
        };
    }
}