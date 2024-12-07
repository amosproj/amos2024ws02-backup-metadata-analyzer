import { ApiProperty } from '@nestjs/swagger';

export class CreateCreationDateAlertDto {
  @ApiProperty({
    description: 'SAveset name of the belonging backup',
    required: true,
  })
  backupSavesetName!: string;

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
