import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BackupDataSizeRangeDto {
  @ApiProperty({
    description: 'The start size of the range',
  })
  @IsNumber()
  startSize!: number;
  @ApiProperty({
    description: 'The end size of the range, -1 means unlimited',
  })
  @IsNumber()
  endSize!: number;

  @ApiProperty({
    description: 'The count of backupData objects in this range',
  })
  @IsNumber()
  count!: number;
}
