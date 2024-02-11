import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseSettings1707619551106 implements MigrationInterface {
  name = 'courseSettings1707619551106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course_settings_model" ("id" SERIAL NOT NULL, "chatBotEnabled" boolean NOT NULL DEFAULT false, "asyncQueueEnabled" boolean NOT NULL DEFAULT false, "adsEnabled" boolean NOT NULL DEFAULT false, "queueEnabled" boolean NOT NULL DEFAULT false, "courseId" integer NOT NULL, CONSTRAINT "REL_0b8c46d3c880227af25ce517ee" UNIQUE ("courseId"), CONSTRAINT "PK_dc829c8be01ae62070af3cfd6e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_model" ADD "courseSettingsId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_model" ADD CONSTRAINT "UQ_4948cd8864914694ae76224a30f" UNIQUE ("courseSettingsId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_settings_model" ADD CONSTRAINT "FK_0b8c46d3c880227af25ce517ee2" FOREIGN KEY ("courseId") REFERENCES "course_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_model" ADD CONSTRAINT "FK_4948cd8864914694ae76224a30f" FOREIGN KEY ("courseSettingsId") REFERENCES "course_settings_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_model" DROP CONSTRAINT "FK_4948cd8864914694ae76224a30f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_settings_model" DROP CONSTRAINT "FK_0b8c46d3c880227af25ce517ee2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_model" DROP CONSTRAINT "UQ_4948cd8864914694ae76224a30f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_model" DROP COLUMN "courseSettingsId"`,
    );
    await queryRunner.query(`DROP TABLE "course_settings_model"`);
  }
}
