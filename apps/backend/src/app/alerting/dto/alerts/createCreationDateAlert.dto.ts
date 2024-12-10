import { ApiProperty } from '@nestjs/swagger';

export class CreateCreationDateAlertDto {

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

  @ApiProperty({
    description: 'Date, the backup should have been started',
    required: true,
  })
  referenceDate!: Date;
}
