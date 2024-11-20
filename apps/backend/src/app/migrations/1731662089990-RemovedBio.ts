import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedBio1731662089990 implements MigrationInterface {
    name = 'RemovedBio1731662089990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "bio"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BackupData" ADD "bio" character varying NOT NULL`);
    }

}
