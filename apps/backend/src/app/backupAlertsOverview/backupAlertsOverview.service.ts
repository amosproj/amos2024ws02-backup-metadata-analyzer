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

    // 2. Dynamische SQL-Joins für alle Alert-Typen erzeugen
    const alertJoins = alertTypes
      .map((alert: { name: string; severity: string }) => {
        const tableName =
          alert.name
            .toLowerCase() // alles klein
            .replace(/_([a-z])/g, (_, char) => char.toUpperCase()) // Konvertiere _a zu A
            .replace(/^([a-z])/, (_, char) => char.toUpperCase()) // Erster Buchstabe groß
            .replace('Alert', '') + 'Alert'; // Füge 'Alert' wieder hinzu

        return `
          LEFT JOIN "${tableName}" ON bd.id = "${tableName}"."backupId" AND "${tableName}"."deprecated" = false
        `;
      })
      .join(' '); // Joins kombinieren

    // 3. Dynamische Join-Bedingung für die AlertType-Tabelle erzeugen
    const alertTypeJoinCondition = alertTypes
      .map((alert: { name: string }) => {
        const tableName =
          alert.name
            .toLowerCase()
            .replace(/_([a-z])/g, (_, char) => char.toUpperCase())
            .replace(/^([a-z])/, (_, char) => char.toUpperCase())
            .replace('Alert', '') + 'Alert';

        return `"${tableName}"."alertTypeId" = at.id`;
      })
      .join(' OR '); // OR-Bedingung für alle Alert-Tabellen

    // 4. Dynamische SQL-Abfrage erstellen
    const query = `
      WITH AlertsByBackup AS (
        SELECT 
          bd.id AS "backupId",
          at.severity
        FROM "BackupData" bd
        ${alertJoins} -- Dynamische Joins für die Alert-Typen
        LEFT JOIN "AlertType" at ON (${alertTypeJoinCondition}) -- Dynamische Join-Bedingung für AlertType
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
        ${alertJoins} -- Dynamische Joins wiederverwendet
        WHERE ${alertTypes
          .map((alert: { name: string }) => {
            const tableName =
              alert.name
                .toLowerCase()
                .replace(/_([a-z])/g, (_, char) => char.toUpperCase())
                .replace(/^([a-z])/, (_, char) => char.toUpperCase())
                .replace('Alert', '') + 'Alert';

            return `"${tableName}"."backupId" IS NULL`;
          })
          .join(' AND ')} -- Dynamische Bedingung für fehlende Alerts
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
    // console.log(query);
    console.log(alertTypes);
    console.log(alertJoins);
    console.log(alertTypeJoinCondition);
    this.severityOverview = dto;
    console.log(this.getSeverityOverview());
    return dto;
  }
}
