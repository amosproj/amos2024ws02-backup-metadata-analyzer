import { MigrationInterface, QueryRunner } from "typeorm";

export class StorageFillAlertChangedColumns1733765217660 implements MigrationInterface {
    name = 'StorageFillAlertChangedColumns1733765217660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "storageFill"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "referenceStorageFill"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "dataStoreName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "filled" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "highWaterMark" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "capacity" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" DROP CONSTRAINT "FK_de933919990c72fd1a912da802c"`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" ALTER COLUMN "backupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP CONSTRAINT "FK_d8ca5879d0992e6ff1291ae838b"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ALTER COLUMN "backupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" DROP CONSTRAINT "FK_5b8e11a0d56c26c9761dcb5ec05"`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ALTER COLUMN "backupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" ADD CONSTRAINT "FK_de933919990c72fd1a912da802c" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD CONSTRAINT "FK_d8ca5879d0992e6ff1291ae838b" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ADD CONSTRAINT "FK_5b8e11a0d56c26c9761dcb5ec05" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" DROP CONSTRAINT "FK_5b8e11a0d56c26c9761dcb5ec05"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP CONSTRAINT "FK_d8ca5879d0992e6ff1291ae838b"`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" DROP CONSTRAINT "FK_de933919990c72fd1a912da802c"`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ALTER COLUMN "backupId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "CreationDateAlert" ADD CONSTRAINT "FK_5b8e11a0d56c26c9761dcb5ec05" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ALTER COLUMN "backupId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD CONSTRAINT "FK_d8ca5879d0992e6ff1291ae838b" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" ALTER COLUMN "backupId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "SizeAlert" ADD CONSTRAINT "FK_de933919990c72fd1a912da802c" FOREIGN KEY ("backupId") REFERENCES "BackupData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "capacity"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "highWaterMark"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "filled"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" DROP COLUMN "dataStoreName"`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "referenceStorageFill" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "StorageFillAlert" ADD "storageFill" integer NOT NULL`);
    }

}
