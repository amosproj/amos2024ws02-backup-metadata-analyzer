import { ApiProperty } from '@nestjs/swagger';

export class CreateCreationDateAlertDto {
  @ApiProperty({
    description: 'Id of the belonging Backup',
    required: true,
  })
  backupId!: string;

  @ApiProperty({
    description: 'Date, the backup started',
    required: true,
  })
  date!: Date;

  @ApiProperty({
    description: 'Date, the backup should have been started',
    required: true,
  })
  referenceDate!: Date;
}
