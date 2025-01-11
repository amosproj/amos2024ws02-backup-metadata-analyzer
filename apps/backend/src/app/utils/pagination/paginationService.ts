import {PaginationOptionsDto} from "./PaginationOptionsDto";
import {FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository} from "typeorm";
import {PaginationDto} from "./PaginationDto";

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
}