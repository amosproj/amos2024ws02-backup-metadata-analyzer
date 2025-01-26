import { ApiProperty } from '@nestjs/swagger';

export class CreateAdditionalBackupAlertDto {
  @ApiProperty({
    description: 'Uuid of the Backup',
    required: true,
  })
  backupId!: string;

  @ApiProperty({
    description: 'Date, the backup started',
    required: true,
  })
  date!: Date;
}
