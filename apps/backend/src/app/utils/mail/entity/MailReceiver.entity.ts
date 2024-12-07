import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('MailReceiver')
export class MailReceiverEntity {
  @ApiProperty({
    description: 'Auto-generated UUID of the Mail Receiver',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Mail Address',
    required: true,
    uniqueItems: true,
  })
  @Column({ nullable: false, unique: true })
  mail!: string;
}
