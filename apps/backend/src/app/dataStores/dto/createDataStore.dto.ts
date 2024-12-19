import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateDataStoreDto {
  @ApiProperty({
    description: 'Uuid',
    required: true,
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: 'Display name',
    required: true,
  })
  @IsString()
  displayName!: string;

  @ApiProperty({
    description: 'Capacity in GB',
    required: true,
  })
  @IsNumber()
  capacity!: number;

  @ApiProperty({
    description: 'High water mark in GB',
    required: true,
  })
  @IsNumber()
  highWaterMark!: number;

  @ApiProperty({
    description: 'Filled in GB',
    required: true,
  })
  @IsNumber()
  filled!: number;
}