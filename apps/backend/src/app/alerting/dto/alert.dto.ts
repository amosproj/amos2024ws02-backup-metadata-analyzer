import { BackupDataEntity } from '../../backupData/entity/backupData.entity';
import { AlertTypeEntity } from '../entity/alertType.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AlertDto<T> {
  @ApiProperty({
    description: 'Auto-generated UUID of the Alert',
    required: true,
  })
  id!: string;

  @ApiProperty({
    description: 'Reason for the alert',
    required: true,
    type: AlertTypeEntity,
  })
  alertType!: AlertTypeEntity;

  @ApiProperty({
    description: 'Backup which triggered the alert',
    required: true,
    type: BackupDataEntity,
  })
  backup!: BackupDataEntity;

  @ApiProperty({
    description: 'Data of the alert',
    required: true,
  })
  data!: T;
}
