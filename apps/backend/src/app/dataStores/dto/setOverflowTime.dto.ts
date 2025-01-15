import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class SetOverflowTimeDto {
  @ApiProperty({ description: 'Time until storage overflow (in days)' })
  @IsNumber()
  @Min(0, { message: 'Overflow time must be 0 or a positive number.' })
  overflowTime!: number;
}
