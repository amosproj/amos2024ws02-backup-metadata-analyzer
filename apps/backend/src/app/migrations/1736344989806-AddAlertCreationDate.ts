import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlertCreationDate1736344989806 implements MigrationInterface {
    name = 'AddAlertCreationDate1736344989806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "SizeAlert" ADD "creationDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "creationDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ADD "creationDate" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" DROP COLUMN "creationDate"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "creationDate"`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" DROP COLUMN "creationDate"`);
    }

}
