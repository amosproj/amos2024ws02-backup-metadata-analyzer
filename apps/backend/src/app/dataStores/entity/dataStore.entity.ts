import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('DataStore')
export class DataStoreEntity {
  @ApiProperty({
    description: 'Uuid',
    required: true,
  })
  @PrimaryColumn()
  id!: string;

  @ApiProperty({
    description: 'Display name',
    required: true,
  })
  @Column({ nullable: false })
  displayName!: string;

  @ApiProperty({
    description: 'Capacity in GB',
    required: true,
  })
  @Column({ nullable: false })
  capacity!: number;

  @ApiProperty({
    description: 'High water mark in GB',
    required: true,
  })
  @Column({ nullable: false })
  highWaterMark!: number;

  @ApiProperty({
    description: 'Filled in GB',
    required: true,
  })
  @Column({ nullable: false })
  filled!: number;

  @ApiProperty({
    description: 'Time until storage overflow',
    required: false,
  })
  @Column({ nullable: true })
  overflowTime?: number;
}
