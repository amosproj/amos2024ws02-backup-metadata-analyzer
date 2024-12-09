import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSavesetName1733754552133 implements MigrationInterface {
    name = 'AddSavesetName1733754552133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" ADD "savesetName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "savesetName"`);
    }

}
