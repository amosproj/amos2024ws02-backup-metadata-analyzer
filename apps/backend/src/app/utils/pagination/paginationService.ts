import {PaginationOptionsDto} from "./PaginationOptionsDto";
import {FindManyOptions, FindOptionsWhere, Repository} from "typeorm";
import {PaginationDto} from "./PaginationDto";

export class PaginationService {

    /**
     * Paginate.
     * @param repository
     * @param paginationOptionsDto
     * @param where
     */
    protected async paginate<T>(
        repository: Repository<any>,
        paginationOptionsDto: PaginationOptionsDto,
        where: FindOptionsWhere<T>,
    ): Promise<PaginationDto<T>> {
        let options: FindManyOptions = {
            order: {
                [paginationOptionsDto.orderBy ?? 'creationDate']: paginationOptionsDto.sortOrder ?? 'DESC',
            },
            where: where,
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