import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeToBytes1732716669345 implements MigrationInterface {
    name = 'ChangeToBytes1732716669345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" RENAME COLUMN "sizeMB" TO "size"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" RENAME COLUMN "size" TO "sizeMB"`);
    }

}
