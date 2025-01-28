import { MigrationInterface, QueryRunner } from "typeorm";

export class DeprecatedFlag1737107214086 implements MigrationInterface {
    name = 'DeprecatedFlag1737107214086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "SizeAlert" ADD "deprecated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "deprecated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ADD "deprecated" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" DROP COLUMN "deprecated"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "deprecated"`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" DROP COLUMN "deprecated"`);
    }

}
