import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AlertStatusDto {
  @ApiProperty({
    description: 'Status of the alert, if it is active or not',
    example: true,
  })
  status!: boolean;
}
