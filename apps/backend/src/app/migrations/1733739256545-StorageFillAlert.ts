import { MigrationInterface, QueryRunner } from "typeorm";

export class StorageFillAlert1733739256545 implements MigrationInterface {
    name = 'StorageFillAlert1733739256545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "StorageFillAlert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "storageFill" integer NOT NULL, "referenceStorageFill" integer NOT NULL, "alertTypeId" uuid NOT NULL, "backupId" character varying NOT NULL, CONSTRAINT "PK_a2b95c0d584c6daca0854d10e6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD CONSTRAINT "FK_dfc1062d341ca0f567f7f0b9425" FOREIGN KEY ("alertTypeId") REFERENCES "AlertType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD CONSTRAINT "FK_d8ca5879d0992e6ff1291ae838b" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP CONSTRAINT "FK_d8ca5879d0992e6ff1291ae838b"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP CONSTRAINT "FK_dfc1062d341ca0f567f7f0b9425"`);
        await queryRunner.query(`DROP TABLE "StorageFillAlert"`);
    }

}
