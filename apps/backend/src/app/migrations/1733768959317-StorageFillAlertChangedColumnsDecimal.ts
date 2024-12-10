import { MigrationInterface, QueryRunner } from "typeorm";

export class StorageFillAlertChangedColumnsDecimal1733768959317 implements MigrationInterface {
    name = 'StorageFillAlertChangedColumnsDecimal1733768959317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "filled"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "filled" numeric(20,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "highWaterMark"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "highWaterMark" numeric(20,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "capacity"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "capacity" numeric(20,6) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "capacity"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "capacity" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "highWaterMark"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "highWaterMark" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "filled"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "filled" integer NOT NULL`);
    }

}
