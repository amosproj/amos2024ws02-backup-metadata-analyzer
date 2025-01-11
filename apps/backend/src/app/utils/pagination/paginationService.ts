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
        order: FindOptionsOrder<T>,
        where: FindOptionsWhere<T>,
        paginationOptionsDto: PaginationOptionsDto
    ): Promise<PaginationDto<T>> {
        let unionQuery = '';

        // Do a query for each repository and combine them with UNION
        for (let i = 0; i < repositories.length; i++) {
            const subQuery = repositories[i].createQueryBuilder(`alias${i}`)
                .select()
                .where(where)
                .getQuery();

            unionQuery += (i > 0 ? ' UNION ALL ' : '') + subQuery;
        }

        let queryBuilder = repositories[0].createQueryBuilder()
            .select('*')
            .from(`(${unionQuery})`, 'combined');

        // Apply order
        for (const [key, value] of Object.entries(order)) {
            queryBuilder = queryBuilder.addOrderBy(`combined.${key}`, value as any);
        }

        // Apply pagination
        if (paginationOptionsDto.offset) {
            queryBuilder = queryBuilder.skip(paginationOptionsDto.offset);
        }
        if (paginationOptionsDto.limit) {
            queryBuilder = queryBuilder.take(paginationOptionsDto.limit);
        }

        // Execute the query and get the results
        const [data, total] = await queryBuilder.getManyAndCount() as [T[], number];

        return {
            data,
            paginationData: {
                offset: paginationOptionsDto.offset,
                limit: paginationOptionsDto.limit,
                total,
            }
        };
    }
}

