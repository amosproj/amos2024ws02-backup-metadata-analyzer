import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BackupType } from '../dto/backupType';

@Entity('BackupData')
export class BackupDataEntity {
  @ApiProperty({
    description: 'Uuid',
    required: true,
  })
  @PrimaryColumn()
  id!: string;

  @ApiProperty({
    description: 'Size of Backup in MB',
    nullable: false,
    required: true,
  })
  @Column({ type: 'decimal', precision: 20, scale: 6 })
  sizeMB!: number;

  @ApiProperty({
    description: 'Type of Backup',
    nullable: false,
    required: true,
    enum: BackupType,
  })
  @Column({
    type: 'enum',
    enum: BackupType,
    default: BackupType.FULL,
  })
  type!: BackupType;

  @ApiProperty({
    description: 'Creation Date of Backup',
    nullable: false,
    required: true,
  })
  @Column()
  creationDate!: Date;
}
