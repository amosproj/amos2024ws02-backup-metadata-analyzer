import {IsArray, IsNumber, IsOptional, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class PaginationDataDto {
    @ApiProperty({
        description: 'Number of skipped items',
    })
    @IsOptional()
    @IsNumber()
    offset?: number;

    @ApiProperty({
        description: 'Number of items for the page',
    })
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiProperty({
        description: 'Total number of items',
    })
    @IsNumber()
    total!: number;
}

export class PaginationDto<T> {
    @ApiProperty({
        isArray: true,
        description: 'Items',
    })
    @IsArray()
    data!: T[];

    @ApiProperty({
        description: 'Pagination Metadata',
    })
    @Type(() => PaginationDataDto)
    @ValidateNested()
    paginationData!: PaginationDataDto;
}