import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbConfigService} from "./db-config.service";
import {DemoModule} from "./demo/demo.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: DbConfigService,
        }),
        DemoModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
