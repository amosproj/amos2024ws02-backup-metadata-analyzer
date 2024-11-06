import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString, IsUUID} from 'class-validator';

export class CreateEntryDto {
    @ApiProperty({
        description: 'Text',
        nullable: false,
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    text!: string;
}
