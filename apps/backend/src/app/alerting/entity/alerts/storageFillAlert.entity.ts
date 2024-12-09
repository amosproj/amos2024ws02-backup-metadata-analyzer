import { Column, Entity } from 'typeorm';
import { Alert } from './alert';
import { ApiProperty } from '@nestjs/swagger';

@Entity('StorageFillAlert')
export class StorageFillAlertEntity extends Alert {
  @ApiProperty({
    description: 'Available storage, the system actual has after backup',
  })
  @Column()
  storageFill!: number;

  @ApiProperty({
    description: 'Available storage, the system should have',
  })
  @Column()
  referenceStorageFill!: number;
}
