import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Task')
export class TaskEntity {
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
}
