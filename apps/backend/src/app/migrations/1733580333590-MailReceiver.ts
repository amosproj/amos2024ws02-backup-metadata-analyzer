import { MigrationInterface, QueryRunner } from "typeorm";

export class MailReceiver1733580333590 implements MigrationInterface {
    name = 'MailReceiver1733580333590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "MailReceiver" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mail" character varying NOT NULL, CONSTRAINT "UQ_9b0a9d71b5bb67a4b0bb2499b4c" UNIQUE ("mail"), CONSTRAINT "PK_71d9ee85e0f42a3a278d0ed19cf" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "MailReceiver"`);
    }

}
