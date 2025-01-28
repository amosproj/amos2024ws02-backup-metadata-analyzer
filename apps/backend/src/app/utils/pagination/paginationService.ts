import { PaginationOptionsDto } from './PaginationOptionsDto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { PaginationDto } from './PaginationDto';
import {
  ADDITIONAL_BACKUP_ALERT,
  CREATION_DATE_ALERT,
  MISSING_BACKUP_ALERT,
  SIZE_ALERT,
  STORAGE_FILL_ALERT,
} from '../constants';
import { AlertTypeEntity } from '../../alerting/entity/alertType.entity';
import { Alert } from '../../alerting/entity/alerts/alert';
import { SizeAlertEntity } from '../../alerting/entity/alerts/sizeAlert.entity';
import { CreationDateAlertEntity } from '../../alerting/entity/alerts/creationDateAlert.entity';
import { StorageFillAlertEntity } from '../../alerting/entity/alerts/storageFillAlert.entity';
import { MissingBackupAlertEntity } from '../../alerting/entity/alerts/missingBackupAlert.entity';
import { AdditionalBackupAlertEntity } from '../../alerting/entity/alerts/additionalBackupAlert.entity';
import { AlertOrderOptionsDto } from '../../alerting/dto/alertOrderOptions.dto';

export class PaginationService {
  /**
   * Paginate.
   * @param repository
   * @param order
   * @param where
   * @param paginationOptionsDto
   */
  protected async paginate<T>(
    repository: Repository<any>,
    order: FindOptionsOrder<T>,
    where: FindOptionsWhere<T>,
    paginationOptionsDto: PaginationOptionsDto
  ): Promise<PaginationDto<T>> {
    let options: FindManyOptions = {
      order,
      where,
    };

    if (paginationOptionsDto.offset) {
      options = { skip: paginationOptionsDto.offset, ...options };
    }
    if (paginationOptionsDto.limit) {
      options = { take: paginationOptionsDto.limit, ...options };
    }

    const [data, total] = await repository.findAndCount(options);
    return {
      data,
      paginationData: {
        offset: paginationOptionsDto.offset,
        limit: paginationOptionsDto.limit,
        total,
      },
    };
  }

  /**
   * Paginate.
   * @param repositories
   * @param alertTypeRepository
   * @param orderInfo
   * @param whereClause
   * @param paginationOptionsDto
   */
  protected async paginateAlerts<T>(
    repositories: Repository<any>[],
    alertTypeRepository: Repository<AlertTypeEntity>,
    orderInfo: AlertOrderOptionsDto,
    whereClause: any,
    paginationOptionsDto: PaginationOptionsDto
  ): Promise<PaginationDto<T>> {
    // Define the columns to select and their types
    const columns = [
      'id',
      'alertTypeId',
      'backupId',
      'severity',
      'creationDate',
      'deprecated',
    ];

    const { parameters, unionQuery } = this.createUnionQuery(
      repositories,
      whereClause,
      columns
    );
    const orderClause = this.createOrderClauseString(orderInfo);

    // Apply pagination
    const offset = paginationOptionsDto.offset ?? 0;
    const limit = paginationOptionsDto.limit ?? 10;

    const paginatedQuery = `
        SELECT *
        FROM (${unionQuery}) AS combined
            ${orderClause}
        OFFSET ${offset} LIMIT ${limit}
    `;

    // Execute the raw SQL query
    let [data, total] = await Promise.all([
      repositories[0].query(paginatedQuery, parameters),
      repositories[0].query(
        `SELECT COUNT(*)
         FROM (${unionQuery}) AS combined`,
        parameters
      ),
    ]);

    const alertTypeIds: Map<string, string> = await this.getAlertTypeMap(data, alertTypeRepository);

    // get full alert objects from the repositories
    const alerts: Alert[] = [];

    for (const alertId of alertTypeIds.keys()) {
      const alertType = alertTypeIds.get(alertId);
      if (alertType) {
        const alert = await this.getAlertFromRepository(
          repositories,
          alertId,
          alertType
        );
        if (alert) {
          alerts.push(alert);
        }
      }
    }

    data = alerts;

    return {
      data,
      paginationData: {
        offset,
        limit,
        total: parseInt(total[0].count, 10),
      },
    };
  }

  private async getAlertTypeMap(data: any, alertTypeRepository: Repository<AlertTypeEntity>) {
    const alertTypeIds: Map<string, string> = new Map<string, string>();
    for (const alert of data) {
      if (alert.alertTypeId) {
        const alertType = await alertTypeRepository.findOne({
          where: { id: alert.alertTypeId }, // Provide the where clause
        });
        if (alertType) {
          alertTypeIds.set(alert.id, alertType.name);
        }
      }
    }
    return alertTypeIds;
  }

  /**
   * Takes the order information from the requests and builds an SQL string based on it
   * @param orderInfo
   * @returns SQL string for the order clause
   */
  private createOrderClauseString(orderInfo: AlertOrderOptionsDto) {
    let orderClause = '';
    if (orderInfo.orderBy === 'severity') {
      orderClause = `
            ORDER BY CASE 
            WHEN severity = 'CRITICAL' THEN 3
            WHEN severity = 'WARNING' THEN 2
            WHEN severity = 'INFO' THEN 1
            ELSE 4
            END ${orderInfo.sortOrder === 'ASC' ? 'ASC' : 'DESC'}
            `;
    } else if (orderInfo.orderBy === 'date') {
      orderClause = `ORDER BY creationDate ${
        orderInfo.sortOrder === 'ASC' ? 'ASC' : 'DESC'
      }`;
    }
    return orderClause;
  }

  /**
   * Combines tables with UNION and applies where conditions based on whereClause
   * @param repositories
   * @param whereClause
   * @param columns the coluns to select from the combined table. Every one has to be present in each table.
   * @returns
   */
  private createUnionQuery(
    repositories: Repository<any>[],
    whereClause: any,
    columns: string[]
  ) {
    const parameters = [];
    let unionQuery = '';

    // Do a query for each repository and combine them with UNION
    for (let i = 0; i < repositories.length; i++) {
      const whereConditions = [];
      //Only use alerts, whose alertType is user_active and master_active
      whereConditions.push(
        'alertType.user_active = true AND alertType.master_active = true'
      );
      if (whereClause.severity) {
        whereConditions.push(`alertType.severity = $${parameters.length + 1}`);
        parameters.push(whereClause.severity);
      }
      if (whereClause.id) {
        whereConditions.push(`CAST(alias${i}.id AS TEXT) LIKE $${parameters.length + 1}`);
        parameters.push(`%${whereClause.id}%`);
      }
      if (whereClause.backupId) {
        whereConditions.push(`alias${i}.backupId = $${parameters.length + 1}`); // Use = for uuid type
        parameters.push(whereClause.backupId);
      }
      if (whereClause.fromDate && whereClause.toDate) {
        whereConditions.push(
          `alias${i}.creationDate BETWEEN $${parameters.length + 1} AND $${
            parameters.length + 2
          }`
        );
        parameters.push(whereClause.fromDate, whereClause.toDate);
      } else if (whereClause.fromDate) {
        whereConditions.push(
          `alias${i}.creationDate >= $${parameters.length + 1}`
        );
        parameters.push(whereClause.fromDate);
      } else if (whereClause.toDate) {
        whereConditions.push(
          `alias${i}.creationDate <= $${parameters.length + 1}`
        );
        parameters.push(whereClause.toDate);
      } else if (whereClause.alertType) {
        whereConditions.push(`alertType.name = $${parameters.length + 1}`);
        parameters.push(whereClause.alertType);
      }
      if (
        whereClause.includeDeprecated === 'false' ||
        whereClause.includeDeprecated === false ||
        whereClause.includeDeprecated === undefined
      ) {
        whereConditions.push(`alias${i}.deprecated = FALSE`);
      }
      whereConditions.push(`alertType.user_active = TRUE`);
      whereConditions.push(`alertType.master_active = TRUE`);

      const whereClauseString =
        whereConditions.length > 0 ? `${whereConditions.join(' AND ')}` : '';

      const subQuery = repositories[i]
        .createQueryBuilder(`alias${i}`)
        .select(
          columns
            .map((column) => {
              if (column === 'severity') {
                return `alertType.${column} AS ${column}`;
              }
              if (column === 'creationDate') {
                return `alias${i}.${column} AS ${column}`;
              }
              return `alias${i}.${column}`;
            })
            .join(', ')
        )
        .leftJoinAndSelect(`alias${i}.alertType`, 'alertType')
        .where(whereClauseString, parameters)
        .getQuery();

      unionQuery += (i > 0 ? ' UNION ALL ' : '') + subQuery;
    }
    return { parameters, unionQuery };
  }

  private async getAlertFromRepository(
    repositories: Repository<any>[],
    alertId: string,
    type: string
  ): Promise<Alert | undefined> {
    switch (type) {
      case SIZE_ALERT:
        return (await repositories[0].findOne({
          where: { id: alertId },
        })) as SizeAlertEntity;
      case CREATION_DATE_ALERT:
        return (await repositories[1].findOne({
          where: { id: alertId },
        })) as CreationDateAlertEntity;
      case STORAGE_FILL_ALERT:
        return (await repositories[2].findOne({
          where: { id: alertId },
        })) as StorageFillAlertEntity;
      case MISSING_BACKUP_ALERT:
        return (await repositories[3].findOne({
          where: { id: alertId },
        })) as MissingBackupAlertEntity;
      case ADDITIONAL_BACKUP_ALERT:
        return (await repositories[4].findOne({
          where: { id: alertId },
        })) as AdditionalBackupAlertEntity;
      default:
        return undefined;
    }
  }
}
