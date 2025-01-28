import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlertMissingBackup1736620579537 implements MigrationInterface {
    name = 'AddAlertMissingBackup1736620579537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "MissingBackupAlert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "referenceDate" TIMESTAMP NOT NULL, "alertTypeId" uuid NOT NULL, "backupId" character varying, CONSTRAINT "PK_434bd365df1f2a6947c4a8daa1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "MissingBackupAlert" ADD CONSTRAINT "FK_8078a1e8739f5f580fcfe701124" FOREIGN KEY ("alertTypeId") REFERENCES "AlertType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "MissingBackupAlert" ADD CONSTRAINT "FK_1eee41b2b86624061e168aee257" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "MissingBackupAlert" DROP CONSTRAINT "FK_1eee41b2b86624061e168aee257"`);
        await queryRunner.query(`ALTER TABLE "MissingBackupAlert" DROP CONSTRAINT "FK_8078a1e8739f5f580fcfe701124"`);
        await queryRunner.query(`DROP TABLE "MissingBackupAlert"`);
    }

}
