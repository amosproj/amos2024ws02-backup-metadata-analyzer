import {OrderBy} from "./OrderBy";
import {IsEnum, IsOptional} from "class-validator";
import {SortOrder} from "./SortOrder";
import {ApiProperty} from "@nestjs/swagger";

export class PaginationOptionsDto {
    @ApiProperty({
        description: 'Number of skipped items',
        required: false,
    })
    @IsOptional()
    offset?: number;

    @ApiProperty({
        description: 'Number of items',
        required: false,
    })
    @IsOptional()
    limit?: number;

    @ApiProperty({
        description: 'Order by',
        enum: OrderBy,
        required: false,
    })
    @IsOptional()
    @IsEnum(OrderBy)
    orderBy?: OrderBy;

    @ApiProperty({
        description: 'Sort order',
        enum: SortOrder,
        required: false,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;
}