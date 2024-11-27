import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateBackupDataDto {
  @ApiProperty({
    description: 'Uuid',
    required: true,
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: 'Size of Backup in Bytes',
    nullable: false,
    required: true,
  })
  @IsNumber()
  size!: number;

  @ApiProperty({
    description: 'Creation Date of Backup',
    nullable: false,
    required: true,
  })
  @IsString()
  creationDate!: Date;
}
