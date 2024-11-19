import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbConfigService} from "./db-config.service";
import {DemoModule} from "./demo/demo.module";
import {BackupDataModule} from "./backupData/backupData.module";
import { AlertingModule } from './alerting/alerting.module';

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
        AlertingModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
