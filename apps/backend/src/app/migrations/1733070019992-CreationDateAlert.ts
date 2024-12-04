import { MigrationInterface, QueryRunner } from "typeorm";

export class CreationDateAlert1733070019992 implements MigrationInterface {
    name = 'CreationDateAlert1733070019992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "CreationDateAlert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL, "referenceDate" TIMESTAMP NOT NULL, "alertTypeId" uuid NOT NULL, "backupId" character varying NOT NULL, CONSTRAINT "PK_b88f06a9330b3b1d33b9f9e1880" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ADD CONSTRAINT "FK_69b6dafd053f10cc85ddc51392a" FOREIGN KEY ("alertTypeId") REFERENCES "AlertType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ADD CONSTRAINT "FK_5b8e11a0d56c26c9761dcb5ec05" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" DROP CONSTRAINT "FK_5b8e11a0d56c26c9761dcb5ec05"`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" DROP CONSTRAINT "FK_69b6dafd053f10cc85ddc51392a"`);
        await queryRunner.query(`DROP TABLE "CreationDateAlert"`);
    }

}
