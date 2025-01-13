import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SeverityType } from './severityType';

export class AlertFilterDto {
  @ApiProperty({
    description: 'Search string for id',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Severity',
    required: false,
  })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiProperty({
    description: 'Backup ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  backupId?: string;

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
}