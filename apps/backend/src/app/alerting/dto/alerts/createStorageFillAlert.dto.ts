import { ApiProperty } from '@nestjs/swagger';

export class CreateStorageFillAlertDto {
  @ApiProperty({
    description: 'Name of the data_store',
    required: true,
  })
  dataStoreName!: string;

  @ApiProperty({
    description: 'Used storage',
    required: true,
  })
  filled!: number;

  @ApiProperty({
    description: 'Alert threshold',
    required: true,
  })
  highWaterMark!: number;

  @ApiProperty({
    description: 'Capacity of the data store',
    required: true,
  })
  capacity!: number;
}
