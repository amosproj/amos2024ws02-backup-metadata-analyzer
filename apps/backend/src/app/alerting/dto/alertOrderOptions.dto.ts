import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SortOrder } from '../../utils/pagination/SortOrder';

export enum AlertOrderByOptions {
  SEVERITY = 'severity',
  DATE = 'date',
}

export class AlertOrderOptionsDto {
  @ApiProperty({
    description: 'Order by',
    enum: AlertOrderByOptions,
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertOrderByOptions)
  orderBy?: AlertOrderByOptions;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
