import { ApiProperty } from '@nestjs/swagger';
import { AlertType } from './alertType';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({
    description: 'Type of alert',
    required: true,
    enum: AlertType,
  })
  @IsEnum(AlertType)
  type!: AlertType;

  @ApiProperty({
    description: 'Value of the Backup, which is the reason for the alert',
    required: true,
  })
  @IsNumber()
  value!: number;

  @ApiProperty({
    description:
      'Reference Value to the value of the Backup, in which comparison the alert was triggered',
    required: true,
  })
  @IsNumber()
  referenceValue!: number;

  @ApiProperty({
    description: 'ID of the belonging backup',
    required: true,
  })
  @IsString()
  backupId!: string;
}
