import { MigrationInterface, QueryRunner } from "typeorm";

export class Alert1732123207805 implements MigrationInterface {
    name = 'Alert1732123207805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Alert_type_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "Alert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."Alert_type_enum" NOT NULL, "value" integer NOT NULL, "referenceValue" integer NOT NULL, "backupId" character varying NOT NULL, CONSTRAINT "PK_e3b013dd68faec2607eb13f50a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Alert" ADD CONSTRAINT "FK_48635f87d697060eb8aabff4df5" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Alert" DROP CONSTRAINT "FK_48635f87d697060eb8aabff4df5"`);
        await queryRunner.query(`DROP TABLE "Alert"`);
        await queryRunner.query(`DROP TYPE "public"."Alert_type_enum"`);
    }

}
