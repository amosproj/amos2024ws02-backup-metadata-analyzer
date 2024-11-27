import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedSizeToDecimal1732720032144 implements MigrationInterface {
    name = 'ChangedSizeToDecimal1732720032144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "sizeMB"`);
        await queryRunner.query(`ALTER TABLE "BackupData" ADD "sizeMB" numeric(20,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Alert" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "Alert" ADD "value" numeric(20,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Alert" DROP COLUMN "referenceValue"`);
        await queryRunner.query(`ALTER TABLE "Alert" ADD "referenceValue" numeric(20,6) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Alert" DROP COLUMN "referenceValue"`);
        await queryRunner.query(`ALTER TABLE "Alert" ADD "referenceValue" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Alert" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "Alert" ADD "value" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "sizeMB"`);
        await queryRunner.query(`ALTER TABLE "BackupData" ADD "sizeMB" integer NOT NULL`);
    }

}
