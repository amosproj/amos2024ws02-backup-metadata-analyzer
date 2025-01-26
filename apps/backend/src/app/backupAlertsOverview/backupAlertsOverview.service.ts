import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

@Injectable()
export class BackupAlertsOverviewService implements OnModuleInit {
  private severityOverview!: BackupAlertsOverviewDto;

  constructor(
    @InjectRepository(BackupDataEntity)
    private readonly backupRepository: Repository<BackupDataEntity>
  ) {}

  async onModuleInit() {
    this.severityOverview = await this.getBackupAlertsBySeverity();
  }

  // Expose the severityOverview variable
  getSeverityOverview(): BackupAlertsOverviewDto {
    return this.severityOverview;
  }

  async getBackupAlertsBySeverity(): Promise<BackupAlertsOverviewDto> {
    const alertTypes = await this.backupRepository.query(`
      SELECT name, severity
      FROM "AlertType"
    `);

    // 1. Find existing tables and store them in an array
    const existingTables = (
      await Promise.all(
        alertTypes.map(async (alert: { name: string }) => {
          const tableName = alert?.name
            ? alert.name
                .toLowerCase()
                .replace(/_([a-z])/g, (_, char) => char.toUpperCase())
                .replace(/^([a-z])/, (_, char) => char.toUpperCase())
                .replace('Alert', '') + 'Alert'
            : null;

          // Check if the table exists
          const tableExists = await this.backupRepository.query(`
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = '${tableName}'
      `);

          if (tableExists.length === 0) {
            console.warn(`Table "${tableName}" does not exist and is skipped.`);
            return null; // Table does not exist, skip
          }

          return tableName; // Table exists, save the name
        })
      )
    ).filter((tableName) => tableName !== null); // Remove `null` values


    // 2. Generate joins from existing tables
    const alertJoins = existingTables
      .map((tableName) => {
        return `
      LEFT JOIN "${tableName}" ON bd.id = "${tableName}"."backupId" AND "${tableName}"."deprecated" = false
    `;
      })
      .join(' ');


    // 3. Generate WHERE conditions from the existing tables
    const whereConditions = existingTables
      .map((tableName) => {
        return `"${tableName}"."backupId" IS NULL`;
      })
      .join(' AND ');


    // 4. Create dynamic join condition for the AlertType table
    const alertTypeJoinCondition = existingTables
      .map((tableName) => {
        return `"${tableName}"."alertTypeId" = at.id`;
      })
      .join(' OR ');


    // 5. Create dynamic SQL query
    const query = `
      WITH AlertsByBackup AS (
        SELECT 
          bd.id AS "backupId",
          at.severity
        FROM "BackupData" bd
        ${alertJoins} -- Dynamic joins for the alert types
        LEFT JOIN "AlertType" at ON (${alertTypeJoinCondition}) -- Dynamic Join Condition for AlertType
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
          END AS "severity"
        FROM AlertsByBackup
        GROUP BY "backupId"
  
        UNION ALL
  
        SELECT 
          bd.id AS "backupId",
          'OK' AS "severity"
        FROM "BackupData" bd
        ${alertJoins} -- Dynamic joins reused
        WHERE ${whereConditions} -- Dynamic condition for missing alerts
      )
      SELECT 
        "severity",
        COUNT(*) AS "totalBackupsForSeverity"
      FROM ClassifiedBackups
      GROUP BY "severity";
    `;


    const result = await this.backupRepository.query(query);

    const dto = new BackupAlertsOverviewDto();
    dto.ok = Number(
      result.find((row: any) => row.severity === 'OK')
        ?.totalBackupsForSeverity || 0
    );
    dto.info = Number(
      result.find((row: any) => row.severity === 'INFO')
        ?.totalBackupsForSeverity || 0
    );
    dto.warning = Number(
      result.find((row: any) => row.severity === 'WARNING')
        ?.totalBackupsForSeverity || 0
    );
    dto.critical = Number(
      result.find((row: any) => row.severity === 'CRITICAL')
        ?.totalBackupsForSeverity || 0
    );

    this.severityOverview = dto;

    return dto;
  }
}
