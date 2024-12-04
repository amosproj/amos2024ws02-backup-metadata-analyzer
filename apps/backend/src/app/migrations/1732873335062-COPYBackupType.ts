import { MigrationInterface, QueryRunner } from "typeorm";

export class COPYBackupType1732873335062 implements MigrationInterface {
    name = 'COPYBackupType1732873335062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."BackupData_type_enum" RENAME TO "BackupData_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."BackupData_type_enum" AS ENUM('FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'COPY')`);
        await queryRunner.query(`ALTER TABLE "BackupData" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "BackupData" ALTER COLUMN "type" TYPE "public"."BackupData_type_enum" USING "type"::"text"::"public"."BackupData_type_enum"`);
        await queryRunner.query(`ALTER TABLE "BackupData" ALTER COLUMN "type" SET DEFAULT 'FULL'`);
        await queryRunner.query(`DROP TYPE "public"."BackupData_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."BackupData_type_enum_old" AS ENUM('FULL', 'INCREMENTAL', 'DIFFERENTIAL')`);
        await queryRunner.query(`ALTER TABLE "BackupData" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "BackupData" ALTER COLUMN "type" TYPE "public"."BackupData_type_enum_old" USING "type"::"text"::"public"."BackupData_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "BackupData" ALTER COLUMN "type" SET DEFAULT 'FULL'`);
        await queryRunner.query(`DROP TYPE "public"."BackupData_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."BackupData_type_enum_old" RENAME TO "BackupData_type_enum"`);
    }

}
