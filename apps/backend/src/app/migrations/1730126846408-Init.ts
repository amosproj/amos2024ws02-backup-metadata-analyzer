import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1730126846408 implements MigrationInterface {
    name = 'Init1730126846408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "demo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying NOT NULL, CONSTRAINT "PK_9d8d89f7764de19ec5a40a5f056" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "demo"`);
    }

}
