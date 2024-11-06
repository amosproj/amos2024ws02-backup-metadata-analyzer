import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsString, IsUUID} from 'class-validator';

export class CreateBackupDataDto {
    @ApiProperty({
        description: 'Uuid',
        required: true,
    })
    @IsUUID()
    id!: string;

    @ApiProperty({
        description: 'Size of Backup in MB',
        nullable: false,
        required: true,
    })
    @IsNumber()
    sizeMB!: number;

    @ApiProperty({
        description: 'Creation Date of Backup',
        nullable: false,
        required: true,
    })
    @IsString()
    creationDate!: Date;

    @ApiProperty({
        description: 'Bio',
        nullable: false,
        required: true,
    })
    @IsString()
    bio!: string;
}