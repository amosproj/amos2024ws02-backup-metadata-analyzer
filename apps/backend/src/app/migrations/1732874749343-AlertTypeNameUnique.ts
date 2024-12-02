import { MigrationInterface, QueryRunner } from "typeorm";

export class AlertTypeNameUnique1732874749343 implements MigrationInterface {
    name = 'AlertTypeNameUnique1732874749343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AlertType" ADD CONSTRAINT "UQ_3a8563f12f1aad0b69b24420fe6" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AlertType" DROP CONSTRAINT "UQ_3a8563f12f1aad0b69b24420fe6"`);
    }

}
