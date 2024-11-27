import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SortOrder } from '../../utils/pagination/SortOrder';

export enum BackupDataOrderByOptions {
  ID = 'id',
  SIZE = 'size',
  BACKUP_DATE = 'creationDate',
}

export class BackupDataOrderOptionsDto {
  @ApiProperty({
    description: 'Order by',
    enum: BackupDataOrderByOptions,
    required: false,
  })
  @IsOptional()
  @IsEnum(BackupDataOrderByOptions)
  orderBy?: BackupDataOrderByOptions;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
