import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateMailReceiverDto {
  @ApiProperty({
    description: 'Mail Address',
    required: true,
    uniqueItems: true,
  })
  @IsEmail()
  mail!: string;
}
