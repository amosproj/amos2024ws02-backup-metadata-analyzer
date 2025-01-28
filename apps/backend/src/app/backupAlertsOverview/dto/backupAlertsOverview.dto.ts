import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BackupAlertsOverviewDto {
  @ApiProperty({
    description: 'Number of backups with no alerts',
    required: true,
  })
  @IsNumber()
  ok!: number;

  @ApiProperty({
    description:
      'Number of backups with at least one INFO alert, but no WARNING or CRITICAL alerts',
    required: true,
  })
  @IsNumber()
  info!: number;

  @ApiProperty({
    description:
      'Number of backups with at least one WARNING alert, but no CRITICAL alerts',
    required: true,
  })
  @IsNumber()
  warning!: number;

  @ApiProperty({
    description: 'Number of backups with at least one CRITICAL alert',
    required: true,
  })
  @IsNumber()
  critical!: number;
}
