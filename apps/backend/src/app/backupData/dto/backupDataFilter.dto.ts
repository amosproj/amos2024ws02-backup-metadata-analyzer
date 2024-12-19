import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BackupType } from './backupType';

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

  @ApiProperty({
    description: 'saveset',
    required: false,
  })
  @IsOptional()
  saveset?: string;

  @ApiProperty({
    description: 'Array of backup types',
    enum: BackupType,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(BackupType, { each: true })
  types?: BackupType[];

  @ApiProperty({
    description: 'From Scheduled Date',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromScheduledDate?: string;

  @ApiProperty({
    description: 'To Scheduled Date',
    required: false,
  })
  @IsOptional()
  @IsString()
  toScheduledDate?: string;
}
