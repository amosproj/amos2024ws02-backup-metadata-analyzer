import { PaginationOptionsDto } from "./PaginationOptionsDto";
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository, SelectQueryBuilder } from "typeorm";
import { PaginationDto } from "./PaginationDto";
import { SIZE_ALERT, CREATION_DATE_ALERT, STORAGE_FILL_ALERT } from "../constants";
import { of } from "rxjs";
import { AlertTypeEntity } from "../../alerting/entity/alertType.entity";
import { Alert } from "../../alerting/entity/alerts/alert";
import { SizeAlertEntity } from "../../alerting/entity/alerts/sizeAlert.entity";
import { CreationDateAlertEntity } from "../../alerting/entity/alerts/creationDateAlert.entity";
import { StorageFillAlertEntity } from "../../alerting/entity/alerts/storageFillAlert.entity";
import { get } from "http";

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
        }

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
            }
        }
    }

    /**
     * Paginate.
     * @param repository
     * @param order
     * @param where
     * @param paginationOptionsDto
     */
    protected async paginateAlerts<T>(
        repositories: Repository<any>[],
        alertTypeRepository: Repository<AlertTypeEntity>,
        whereClause: any,
        paginationOptionsDto: PaginationOptionsDto
    ): Promise<PaginationDto<T>> {
        let unionQuery = '';

        // Define the columns to select and their types
        const columns = [
            'id',
            'alertTypeId',
            'backupId',
        ];

        // Manually construct the where clause


        // Do a query for each repository and combine them with UNION
        for (let i = 0; i < repositories.length; i++) {

            const whereConditions = [];
            if (whereClause.id) {
                whereConditions.push(`alias${i}.id ILIKE '${whereClause.id}%'`);
            }
            if (whereClause.backupId) {
                whereConditions.push(`alias${i}.backupId = '${whereClause.backupId}'`);
            }
            if (whereClause.creationDate) {
                if (whereClause.creationDate.from && whereClause.creationDate.to) {
                    whereConditions.push(`alias${i}.creationDate BETWEEN '${whereClause.creationDate.from.toISOString()}' AND '${whereClause.creationDate.to.toISOString()}'`);
                } else if (whereClause.creationDate.from) {
                    whereConditions.push(`alias${i}.creationDate >= '${whereClause.creationDate.from.toISOString()}'`);
                } else if (whereClause.creationDate.to) {
                    whereConditions.push(`alias${i}.creationDate <= '${whereClause.creationDate.to.toISOString()}'`);
                }
            }
            const whereClauseString = whereConditions.length > 0 ? `${whereConditions.join(' AND ')}` : '';
            console.log('whereClauseString', whereClauseString);
            const subQuery = repositories[i].createQueryBuilder(`alias${i}`)
                .select(columns.map(column => `alias${i}.${column}`).join(', '))
                .leftJoinAndSelect(`alias${i}.alertType`, 'alertType')
                .where(whereClauseString)
                .getQuery();

            unionQuery += (i > 0 ? ' UNION ALL ' : '') + subQuery;
        }

        // Apply pagination
        const offset = paginationOptionsDto.offset || 0;
        const limit = paginationOptionsDto.limit || 10;

        const paginatedQuery = `
            SELECT * FROM (${unionQuery}) AS combined
            OFFSET ${offset} LIMIT ${limit}
        `;

        // Execute the raw SQL query
        let [data, total] = await Promise.all([
            repositories[0].query(paginatedQuery),
            repositories[0].query(`SELECT COUNT(*) FROM (${unionQuery}) AS combined`)
        ]);

        const alertTypeIds: Map<string, string> = new Map<string, string>();
        for (const alert of data) {
            if (alert.alertTypeId) {
                const alertType = await alertTypeRepository.findOne({
                    where: { id: alert.alertTypeId }  // Provide the where clause
                });
                if (alertType) {
                    alertTypeIds.set(alert.id, alertType.name);
                }
            }
        }

        // get full alert objects from the repositories
        const alerts: Alert[] = [];

        for (const alertId of alertTypeIds.keys()) {
            const alertType = alertTypeIds.get(alertId);
            if (alertType) {
                const alert = await this.getAlertFromRepository(repositories, alertId, alertType);
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
            }
        };
    }

    private async getAlertFromRepository(repositories: Repository<any>[], alertId: string, type: string): Promise<Alert | undefined> {
        switch (type) {
            case SIZE_ALERT:
                return await repositories[0].findOne({ where: { id: alertId } }) as SizeAlertEntity;
            case CREATION_DATE_ALERT:
                return await repositories[1].findOne({ where: { id: alertId } }) as CreationDateAlertEntity;
            case STORAGE_FILL_ALERT:
                return await repositories[2].findOne({ where: { id: alertId } }) as StorageFillAlertEntity;
            default:
                return undefined;
        }
    }

}