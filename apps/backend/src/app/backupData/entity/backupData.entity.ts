import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('BackupData')
export class BackupDataEntity {
  @ApiProperty({
    description: 'Uuid',
    required: true,
  })
  @PrimaryColumn()
  id!: string;

  @ApiProperty({
    description: 'Size of Backup in Bytes',
    nullable: false,
    required: true,
  })
  @Column()
  size!: number;

  @ApiProperty({
    description: 'Creation Date of Backup',
    nullable: false,
    required: true,
  })
  @Column()
  creationDate!: Date;
}
