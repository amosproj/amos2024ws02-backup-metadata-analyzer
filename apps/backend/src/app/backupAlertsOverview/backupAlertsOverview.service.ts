import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { SizeAlertEntity } from '../alerting/entity/alerts/sizeAlert.entity';
import { AlertTypeEntity } from '../alerting/entity/alertType.entity';
import { CreationDateAlertEntity } from '../alerting/entity/alerts/creationDateAlert.entity';

@Injectable()
export class BackupAlertsOverviewService {
  constructor(
    @InjectRepository(BackupDataEntity)
    private readonly backupRepository: Repository<BackupDataEntity>,
    @InjectRepository(SizeAlertEntity)
    private readonly sizeAlertRepository: Repository<SizeAlertEntity>,
    @InjectRepository(AlertTypeEntity)
    private readonly alertTypeRepository: Repository<AlertTypeEntity>,
    @InjectRepository(CreationDateAlertEntity)
    private readonly creationDateAlertRepository: Repository<CreationDateAlertEntity>
  ) {}

  async getBackupCount(): Promise<number> {
    // Fetch total count of backups from the database
    return this.backupRepository.count();
  }

  async getSizeAlertCountWithSeverity(): Promise<{
    count: number;
    severity: string;
  }> {
    // Fetch count of unique backups with Size alerts from the database
    const count = await this.sizeAlertRepository
      .createQueryBuilder('sizeAlert')
      .select('COUNT(DISTINCT sizeAlert.backupId)', 'count')
      .where('sizeAlert.deprecated = :deprecated', { deprecated: false })
      .getRawOne();

    // Fetch the severity for Size alerts from the AlertType table
    const severity = await this.alertTypeRepository
      .createQueryBuilder('alertType')
      .select('alertType.severity')
      .where('alertType.name = :name', { name: 'SIZE_ALERT' })
      .getOne();

    return {
      count: Number(count.count),
      severity: severity?.severity || 'UNKNOWN',
    };
  }

  async getCreationDateAlertCountWithSeverity(): Promise<{
    count: number;
    severity: string;
  }> {
    // Fetch count of unique backups with CreationDate alerts from the database
    const count = await this.creationDateAlertRepository
      .createQueryBuilder('creationDateAlert')
      .select('COUNT(DISTINCT creationDateAlert.backupId)', 'count')
      .where('creationDateAlert.deprecated = :deprecated', {
        deprecated: false,
      })
      .getRawOne();

    // Fetch the severity for CreationDate alerts from the AlertType table
    const severity = await this.alertTypeRepository
      .createQueryBuilder('alertType')
      .select('alertType.severity')
      .where('alertType.name = :name', { name: 'CREATION_DATE_ALERT' })
      .getOne();

    return {
      count: Number(count.count),
      severity: severity?.severity || 'UNKNOWN',
    };
  }
}
