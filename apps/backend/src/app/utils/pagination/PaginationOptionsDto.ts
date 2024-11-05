import {IsOptional} from "class-validator";
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
}