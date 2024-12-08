import { ApiProperty } from '@nestjs/swagger';

export class CreateStorageFillAlertDto {
  @ApiProperty({
    description: 'Id of the belonging Backup',
    required: true,
  })
  backupId!: string;

  @ApiProperty({
    description:
      'Storage fill mark of the Backup, which is the reason for the alert',
  })
  storageFill!: number;

  @ApiProperty({
    description:
      'Reference Storage fill to the value of the Backup, in which comparison the alert was triggered',
  })
  referenceStorageFill!: number;
}
