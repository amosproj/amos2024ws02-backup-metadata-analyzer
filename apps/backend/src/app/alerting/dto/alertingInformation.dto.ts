import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AlertingInformationDto {
  @ApiProperty({
    description: 'Reason for the alert',
    required: true,
  })
  @IsString()
  reason!: string;

  @ApiProperty({
    description: 'Description of the alert',
    required: true,
  })
  @IsString()
  description!: string;
}
