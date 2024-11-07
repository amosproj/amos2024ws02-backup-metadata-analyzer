import {Column, Entity, PrimaryColumn,} from 'typeorm';
import {ApiProperty} from "@nestjs/swagger";

@Entity("BackupData")
export class BackupDataEntity {
    @ApiProperty({
        description: 'Uuid',
        required: true,
    })
    @PrimaryColumn()
    id!: string;

    @ApiProperty({
        description: 'Size of Backup in MB',
        nullable: false,
        required: true,
    })
    @Column()
    sizeMB!: number;

    @ApiProperty({
        description: 'Creation Date of Backup',
        nullable: false,
        required: true,
    })
    @Column()
    creationDate!: Date;

    @ApiProperty({
        description: 'Bio',
        nullable: false,
        required: true,
    })
    @Column()
    bio!: string;
}
