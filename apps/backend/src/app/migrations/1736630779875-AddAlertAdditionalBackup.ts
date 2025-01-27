import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlertAdditionalBackup1736630779875 implements MigrationInterface {
    name = 'AddAlertAdditionalBackup1736630779875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "AdditionalBackupAlert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "date" TIMESTAMP NOT NULL, "alertTypeId" uuid NOT NULL, "backupId" character varying, CONSTRAINT "PK_e9dfdad482a1c305890fcd2396c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "AdditionalBackupAlert" ADD CONSTRAINT "FK_c7bf6d9395653dcb441c842a5a9" FOREIGN KEY ("alertTypeId") REFERENCES "AlertType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "AdditionalBackupAlert" ADD CONSTRAINT "FK_9e380378a1b129927c44c1c9b5d" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AdditionalBackupAlert" DROP CONSTRAINT "FK_9e380378a1b129927c44c1c9b5d"`);
        await queryRunner.query(`ALTER TABLE "AdditionalBackupAlert" DROP CONSTRAINT "FK_c7bf6d9395653dcb441c842a5a9"`);
        await queryRunner.query(`DROP TABLE "AdditionalBackupAlert"`);
    }

}
