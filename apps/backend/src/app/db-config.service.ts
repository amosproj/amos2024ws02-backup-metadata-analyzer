import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {DataSourceOptions} from 'typeorm';

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
            entities: [],
            migrationsRun: true,
            migrations: [],
        };
    }
}
