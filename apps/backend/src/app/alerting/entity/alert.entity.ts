import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AlertType } from '../dto/alertType';
import { BackupDataEntity } from '../../backupData/entity/backupData.entity';

@Entity('Alert')
export class AlertEntity {
  @ApiProperty({
    description: 'Auto-generated UUID of the Alert',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Reason for the alert',
    required: true,
    enum: AlertType,
  })
  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type!: AlertType;

  @ApiProperty({
    description: 'Value of the Backup, which is the reason for the alert',
    required: true,
  })
  @Column({ nullable: false })
  value!: number;

  @ApiProperty({
    description:
      'Reference Value to the value of the Backup, in which comparison the alert was triggered',
    required: true,
  })
  @Column({ nullable: false })
  referenceValue!: number;

  @ManyToOne(() => BackupDataEntity, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'backupId' , referencedColumnName: 'id'})
  backup!: BackupDataEntity;
}
