import { Column, Entity } from 'typeorm';
import { Alert } from './alert';
import { ApiProperty } from '@nestjs/swagger';

@Entity('StorageFillAlert')
export class StorageFillAlertEntity extends Alert {
  @ApiProperty({
    description: 'Name of the data_store',
  })
  @Column()
  dataStoreName!: string;

  @ApiProperty({
    description: 'Used storage',
  })
  @Column({ type: 'decimal', precision: 20, scale: 6 })
  filled!: number;

  @ApiProperty({
    description: 'Alert threshold',
  })
  @Column({ type: 'decimal', precision: 20, scale: 6 })
  highWaterMark!: number;

  @ApiProperty({
    description: 'Capacity of the data store',
  })
  @Column({ type: 'decimal', precision: 20, scale: 6 })
  capacity!: number;
}
