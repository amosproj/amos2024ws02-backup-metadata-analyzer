import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Uuid',
    required: true,
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'Display name',
    required: true,
  })
  displayName!: string;
}
