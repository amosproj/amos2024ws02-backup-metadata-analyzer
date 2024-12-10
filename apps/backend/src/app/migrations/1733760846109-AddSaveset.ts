import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSaveset1733760846109 implements MigrationInterface {
    name = 'AddSaveset1733760846109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" ADD "saveset" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "saveset"`);
    }

}
