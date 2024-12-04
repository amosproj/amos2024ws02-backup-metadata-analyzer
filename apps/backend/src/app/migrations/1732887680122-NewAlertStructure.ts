import { MigrationInterface, QueryRunner } from "typeorm";

export class NewAlertStructure1732887680122 implements MigrationInterface {
    name = 'NewAlertStructure1732887680122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "SizeAlert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "size" numeric(20,6) NOT NULL, "referenceSize" numeric(20,6) NOT NULL, "alertTypeId" uuid NOT NULL, "backupId" character varying NOT NULL, CONSTRAINT "PK_b2c2090de21927ad3b81ea1ec5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" ADD CONSTRAINT "FK_d359f243b4f8d5c72e8134473db" FOREIGN KEY ("alertTypeId") REFERENCES "AlertType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" ADD CONSTRAINT "FK_de933919990c72fd1a912da802c" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "SizeAlert" DROP CONSTRAINT "FK_de933919990c72fd1a912da802c"`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" DROP CONSTRAINT "FK_d359f243b4f8d5c72e8134473db"`);
        await queryRunner.query(`DROP TABLE "SizeAlert"`);
    }

}
