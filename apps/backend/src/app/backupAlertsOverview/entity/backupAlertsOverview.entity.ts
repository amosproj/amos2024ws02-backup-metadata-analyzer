import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('BackupAlertsOverview')
export class BackupAlertsOverviewEntity {
  @ApiProperty({
    description: 'Unique identifier for the backup alert overview entry',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Number of backups with no alerts',
    required: true,
  })
  @Column({ nullable: false })
  ok!: number;

  @ApiProperty({
    description:
      'Number of backups with at least one INFO alert, but no WARNING or CRITICAL alerts',
    required: true,
  })
  @Column({ nullable: false })
  info!: number;

  @ApiProperty({
    description:
      'Number of backups with at least one WARNING alert, but no CRITICAL alerts',
    required: true,
  })
  @Column({ nullable: false })
  warning!: number;

  @ApiProperty({
    description: 'Number of backups with at least one CRITICAL alert',
    required: true,
  })
  @Column({ nullable: false })
  critical!: number;
}
