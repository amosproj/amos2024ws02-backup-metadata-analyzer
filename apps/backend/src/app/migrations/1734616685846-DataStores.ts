import { MigrationInterface, QueryRunner } from "typeorm";

export class DataStores1734616685846 implements MigrationInterface {
    name = 'DataStores1734616685846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "DataStore" ("id" character varying NOT NULL, "displayName" character varying NOT NULL, "capacity" integer NOT NULL, "highWaterMark" integer NOT NULL, "filled" integer NOT NULL, CONSTRAINT "PK_8752546fac07d8f05e793ae8ad4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "DataStore"`);
    }

}
