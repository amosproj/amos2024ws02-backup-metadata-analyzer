import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow<string>('DATABASE_HOST'),
                port: +configService.getOrThrow<string>('DATABASE_PORT'),
                username: configService.getOrThrow<string>('DATABASE_USER'),
                password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
                database: configService.getOrThrow<string>('DATABASE_DATABASE'),
                entities: [],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
