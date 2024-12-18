import { MigrationInterface, QueryRunner } from 'typeorm';

export class Tasks1733397652480 implements MigrationInterface {
  name = 'Tasks1733397652480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "Task"
                             (
                                 "id"          character varying NOT NULL,
                                 "displayName" character varying NOT NULL,
                                 CONSTRAINT "PK_95d9364b8115119ba8b15a43592" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "BackupData"
        ADD "taskId" character varying`);
    await queryRunner.query(`ALTER TABLE "BackupData"
        ADD CONSTRAINT "FK_7e97960e3f81eeb4cf39a087f02" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "BackupData" DROP CONSTRAINT "FK_7e97960e3f81eeb4cf39a087f02"`
    );
    await queryRunner.query(`ALTER TABLE "BackupData" DROP COLUMN "taskId"`);
    await queryRunner.query(`DROP TABLE "Task"`);
  }
}
