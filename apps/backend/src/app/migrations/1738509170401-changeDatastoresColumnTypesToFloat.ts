import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDatastoresColumnTypesToFloat1738509170401 implements MigrationInterface {
    name = 'ChangeDatastoresColumnTypesToFloat1738509170401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DataStore" DROP COLUMN "capacity"`);
        await queryRunner.query(`ALTER TABLE "DataStore" ADD "capacity" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "DataStore" DROP COLUMN "highWaterMark"`);
        await queryRunner.query(`ALTER TABLE "DataStore" ADD "highWaterMark" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "DataStore" DROP COLUMN "filled"`);
        await queryRunner.query(`ALTER TABLE "DataStore" ADD "filled" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DataStore" DROP COLUMN "filled"`);
        await queryRunner.query(`ALTER TABLE "DataStore" ADD "filled" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "DataStore" DROP COLUMN "highWaterMark"`);
        await queryRunner.query(`ALTER TABLE "DataStore" ADD "highWaterMark" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "DataStore" DROP COLUMN "capacity"`);
        await queryRunner.query(`ALTER TABLE "DataStore" ADD "capacity" integer NOT NULL`);
    }

}
