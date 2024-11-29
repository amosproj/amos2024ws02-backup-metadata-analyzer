import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SeverityType } from '../dto/severityType';
import { AlertType } from '../dto/alertType';

@Entity('AlertType')
export class AlertTypeEntity {
  @ApiProperty({
    description: 'Auto-generated UUID of the Alert Type',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Name of the Alert Type',
    required: true,
    uniqueItems: true,
  })
  @Column({ nullable: false, unique: true })
  name!: string;

  @ApiProperty({
    description: 'Severity of the Alert Type',
    required: true,
    enum: SeverityType,
  })
  @Column({
    type: 'enum',
    enum: SeverityType,
    default: SeverityType.WARNING,
    nullable: false,
  })
  severity!: SeverityType;

  @ApiProperty({
    description: 'Is the alert type set active by the user',
    required: true,
  })
  @Column({ nullable: false, default: true })
  user_active!: boolean;

  @ApiProperty({
    description: 'Is the alert type set active by the admin',
    required: true,
  })
  @Column({ nullable: false, default: true })
  master_active!: boolean;
}
