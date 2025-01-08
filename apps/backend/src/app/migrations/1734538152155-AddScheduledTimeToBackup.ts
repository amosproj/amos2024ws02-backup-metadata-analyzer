import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScheduledTimeToBackup1734538152155 implements MigrationInterface {
    name = 'AddScheduledTimeToBackup1734538152155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" ADD "scheduledTime" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "scheduledTime"`);
    }

}
