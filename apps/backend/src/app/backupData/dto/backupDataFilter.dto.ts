import { IsOptional, IsString } from 'class-validator';
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
    description: 'From size in MB',
    required: false,
  })
  @IsOptional()
  fromSizeMB?: number;

  @ApiProperty({
    description: 'To size in MB',
    required: false,
  })
  @IsOptional()
  toSizeMB?: number;

  @ApiProperty({
    description: 'Task id',
    required: false,
  })
  @IsOptional()
  taskId?: string;

  @ApiProperty({
    description: 'Task name',
    required: false,
  })
  @IsOptional()
  taskName?: string;
}
