import { BackupDataEntity } from '../../../backupData/entity/backupData.entity';
import { AlertTypeEntity } from '../alertType.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class Alert {
  @ApiProperty({
    description: 'Auto-generated UUID of the Alert',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => AlertTypeEntity, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'alertTypeId', referencedColumnName: 'id' })
  alertType!: AlertTypeEntity;

  @ManyToOne(() => BackupDataEntity, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'backupId', referencedColumnName: 'id' })
  backup?: BackupDataEntity;

  @ApiProperty({
    description: 'Auto generated creation date of the alert',
    required: true,
  })
  @CreateDateColumn()
  creationDate!: Date;
}
