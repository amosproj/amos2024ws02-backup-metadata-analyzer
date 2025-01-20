import { MigrationInterface, QueryRunner } from "typeorm";

export class BackupAlertsOverview1737367335003 implements MigrationInterface {
    name = 'BackupAlertsOverview1737367335003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "BackupAlertsOverview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ok" integer NOT NULL, "info" integer NOT NULL, "warning" integer NOT NULL, "critical" integer NOT NULL, CONSTRAINT "PK_cf79bd993884094d3a176a1b457" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "BackupAlertsOverview"`);
    }

}
