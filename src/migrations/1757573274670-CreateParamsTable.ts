import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateParamsTable1699999999999 implements MigrationInterface {
  name = 'CreateParamsTable1699999999999'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create ENUM type
    await queryRunner.query(`CREATE TYPE enum_type AS ENUM ('Number', 'String', 'Date')`);

    // 2. Create table
    await queryRunner.query(`
      CREATE TABLE params (
        id SERIAL PRIMARY KEY,
        param VARCHAR(100) NOT NULL,
        type enum_type NOT NULL,
        intvalue INTEGER,
        stringvalue VARCHAR(255)
      )
    `);

    // 3. Insert initial record
    await queryRunner.query(`
      INSERT INTO params (param, type, intvalue, stringvalue)
      VALUES ('ping', 'String', 0, 'Pong')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table first
    await queryRunner.query(`DROP TABLE IF EXISTS params`);

    // Drop ENUM type
    await queryRunner.query(`DROP TYPE IF EXISTS enum_type`);
  }
}