import { MigrationInterface, QueryRunner } from "typeorm";

export class DeprecatedFlagNewAlerts1737406388351 implements MigrationInterface {
    name = 'DeprecatedFlagNewAlerts1737406388351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "MissingBackupAlert" ADD "deprecated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "AdditionalBackupAlert" ADD "deprecated" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AdditionalBackupAlert" DROP COLUMN "deprecated"`);
        await queryRunner.query(`ALTER TABLE "MissingBackupAlert" DROP COLUMN "deprecated"`);
    }

}
