import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsUUID} from 'class-validator';

export class DemoDto {
    @ApiProperty()
    @IsUUID()
    id!: string;

    @ApiProperty()
    @IsString()
    text!: string;
}
