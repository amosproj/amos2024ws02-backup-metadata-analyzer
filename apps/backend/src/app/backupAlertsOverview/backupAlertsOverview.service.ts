import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';
import { BackupAlertsOverviewEntity } from './entity/backupAlertsOverview.entity';

@Injectable()
export class BackupAlertsOverviewService {
  constructor(
    @InjectRepository(BackupDataEntity)
    private readonly backupRepository: Repository<BackupDataEntity>,
    @InjectRepository(BackupAlertsOverviewEntity)
    private readonly backupAlertsOverviewRepository: Repository<BackupAlertsOverviewEntity>
  ) {}

  async getBackupCountsByAlertClass(): Promise<BackupAlertsOverviewDto> {
    const query = `
          WITH AlertsByBackup AS (
      SELECT 
        bd.id AS "backupId",
        at.severity
      FROM "BackupData" bd
      LEFT JOIN "SizeAlert" sa ON bd.id = sa."backupId" AND sa.deprecated = false
      LEFT JOIN "CreationDateAlert" cda ON bd.id = cda."backupId" AND cda.deprecated = false
      LEFT JOIN "AlertType" at ON (sa."alertTypeId" = at.id OR cda."alertTypeId" = at.id)
      WHERE at.severity IS NOT NULL
    ),
    ClassifiedBackups AS (
      SELECT 
        "backupId",
        CASE
          WHEN COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) > 0 THEN 'CRITICAL'
          WHEN COUNT(CASE WHEN severity = 'WARNING' THEN 1 END) > 0 THEN 'WARNING'
          WHEN COUNT(CASE WHEN severity = 'INFO' THEN 1 END) > 0 THEN 'INFO'
          ELSE 'OK'
        END AS "alertClass"
      FROM AlertsByBackup
      GROUP BY "backupId"

      UNION ALL

      SELECT 
        bd.id AS "backupId",
        'OK' AS "alertClass"
      FROM "BackupData" bd
      LEFT JOIN "SizeAlert" sa ON bd.id = sa."backupId" AND sa.deprecated = false
      LEFT JOIN "CreationDateAlert" cda ON bd.id = cda."backupId" AND cda.deprecated = false
      WHERE sa."backupId" IS NULL AND cda."backupId" IS NULL
    )
    SELECT 
      "alertClass",
      COUNT(*) AS "totalBackupsForClass"
    FROM ClassifiedBackups
    GROUP BY "alertClass";
  `;

    const result = await this.backupRepository.query(query);

    const dto = new BackupAlertsOverviewDto();
    dto.ok = Number(
      result.find((row: any) => row.alertClass === 'OK')
        ?.totalBackupsForClass || 0
    );
    dto.info = Number(
      result.find((row: any) => row.alertClass === 'INFO')
        ?.totalBackupsForClass || 0
    );
    dto.warning = Number(
      result.find((row: any) => row.alertClass === 'WARNING')
        ?.totalBackupsForClass || 0
    );
    dto.critical = Number(
      result.find((row: any) => row.alertClass === 'CRITICAL')
        ?.totalBackupsForClass || 0
    );
    // Insert results in the BackupAlertsOverview table
    await this.backupAlertsOverviewRepository
      .createQueryBuilder()
      .insert()
      .into('BackupAlertsOverview')
      .values({
        id: '00000000-0000-0000-0000-000000000001',
        ok: dto.ok,
        info: dto.info,
        warning: dto.warning,
        critical: dto.critical,
      })
      .orUpdate(['ok', 'info', 'warning', 'critical'], ['id'])
      .execute();

    return dto;
  }
}
