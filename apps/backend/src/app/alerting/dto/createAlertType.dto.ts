import { ApiProperty } from '@nestjs/swagger';
import { SeverityType } from './severityType';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

export class CreateAlertTypeDto {
  @ApiProperty({
    description: 'Name of the alert type',
    example: 'SIZE_ALERT',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Severity of the alert type',
    enum: SeverityType,
    example: SeverityType.WARNING,
  })
  @IsEnum(SeverityType)
  severity!: SeverityType;

  @ApiProperty({
    description: 'Is the alert type set active by the admin',
    example: true,
  })
  @IsBoolean()
  master_active!: boolean;
}
