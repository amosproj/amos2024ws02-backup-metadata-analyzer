import { IsEnum, IsOptional, IsString } from 'class-validator';
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
  severity?: SeverityType;
}