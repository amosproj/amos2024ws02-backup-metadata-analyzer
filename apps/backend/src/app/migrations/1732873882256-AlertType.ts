import { MigrationInterface, QueryRunner } from "typeorm";

export class AlertType1732873882256 implements MigrationInterface {
    name = 'AlertType1732873882256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."AlertType_severity_enum" AS ENUM('INFO', 'WARNING', 'CRITICAL')`);
        await queryRunner.query(`CREATE TABLE "AlertType" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "severity" "public"."AlertType_severity_enum" NOT NULL DEFAULT 'WARNING', "user_active" boolean NOT NULL DEFAULT true, "master_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b6aa8ea5fe488881a86839631dd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "AlertType"`);
        await queryRunner.query(`DROP TYPE "public"."AlertType_severity_enum"`);
    }

}
