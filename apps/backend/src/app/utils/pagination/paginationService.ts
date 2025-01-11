import {PaginationOptionsDto} from "./PaginationOptionsDto";
import {FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository, SelectQueryBuilder} from "typeorm";
import {PaginationDto} from "./PaginationDto";
import { of } from "rxjs";

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
            options = {skip: paginationOptionsDto.offset, ...options};
        }
        if (paginationOptionsDto.limit) {
            options = {take: paginationOptionsDto.limit, ...options};
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
    protected async paginateMultiple<T>(
        repositories: Repository<any>[],
        paginationOptionsDto: PaginationOptionsDto
    ): Promise<PaginationDto<T>> {
        let unionQuery = '';

        // Define the columns to select and their types
        const columns = [
            'id',
        ];

        // Do a query for each repository and combine them with UNION
        for (let i = 0; i < repositories.length; i++) {
            const subQuery = repositories[i].createQueryBuilder(`alias${i}`)
                .select(columns.map(column => `alias${i}.${column}`).join(', '))
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
        const [data, total] = await Promise.all([
            repositories[0].query(paginatedQuery),
            repositories[0].query(`SELECT COUNT(*) FROM (${unionQuery}) AS combined`)
        ]);

        return {
            data,
            paginationData: {
                offset,
                limit,
                total: parseInt(total[0].count, 10),
            }
        };
    }
}

