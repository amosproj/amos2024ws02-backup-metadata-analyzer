import {Column, Entity, PrimaryGeneratedColumn,} from 'typeorm';
import {ApiProperty} from "@nestjs/swagger";

@Entity("demo")
export class DemoEntity {
    @ApiProperty({
        description: 'Auto-generated uuid',
        required: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({
        description: 'Text',
        nullable: false,
        required: true,
    })
    @Column()
    text!: string;
}
