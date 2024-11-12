import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { DbConfigService } from './app/db-config.service';

/**
 * This file is used by typeorm to find the datasource.
 */
config();

const configService = new ConfigService();

export default new DataSource(
    new DbConfigService(configService).createTypeOrmOptions(),
);
