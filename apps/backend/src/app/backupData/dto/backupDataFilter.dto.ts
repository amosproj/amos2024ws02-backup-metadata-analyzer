import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BackupDataFilterDto {
  @ApiProperty({
    description: 'Search string for id',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'From Date',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiProperty({
    description: 'To Date',
    required: false,
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiProperty({
    description: 'From size in Bytes',
    required: false,
  })
  @IsOptional()
  fromSize?: number;

  @ApiProperty({
    description: 'To size in Bytes',
    required: false,
  })
  @IsOptional()
  toSize?: number;
}
