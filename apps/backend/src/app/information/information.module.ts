import { Module } from '@nestjs/common';
import { InformationService } from './information.service';
import { InformationController } from './information.controller';
import { BackupDataModule } from '../backupData/backupData.module';

@Module({
  providers: [InformationService],
  imports: [BackupDataModule],
  controllers: [InformationController],
})
export class InformationModule {}
