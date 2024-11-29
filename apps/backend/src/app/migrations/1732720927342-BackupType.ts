import { MigrationInterface, QueryRunner } from "typeorm";

export class BackupType1732720927342 implements MigrationInterface {
    name = 'BackupType1732720927342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."BackupData_type_enum" AS ENUM('FULL', 'INCREMENTAL', 'DIFFERENTIAL')`);
        await queryRunner.query(`ALTER TABLE "BackupData" ADD "type" "public"."BackupData_type_enum" NOT NULL DEFAULT 'FULL'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."BackupData_type_enum"`);
    }

}
