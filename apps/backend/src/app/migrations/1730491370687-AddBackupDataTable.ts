import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBackupDataTable1730491370687 implements MigrationInterface {
    name = 'AddBackupDataTable1730491370687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "BackupData" ("id" character varying NOT NULL, "sizeMB" integer NOT NULL, "creationDate" TIMESTAMP NOT NULL, "bio" character varying NOT NULL, CONSTRAINT "PK_72871f0821b9c7e1af735908889" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "BackupData"`);
    }

}
