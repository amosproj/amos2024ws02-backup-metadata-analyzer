import { MigrationInterface, QueryRunner } from "typeorm";

export class StorageOverflowTime1736550460789 implements MigrationInterface {
    name = 'StorageOverflowTime1736550460789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DataStore" ADD "overflowTime" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DataStore" DROP COLUMN "overflowTime"`);
    }

}
