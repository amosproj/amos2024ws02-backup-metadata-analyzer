import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BackupSizesPerDayDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sizeMB!: number;
}
