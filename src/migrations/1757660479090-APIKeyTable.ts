import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApiKeysTable1726145210000 implements MigrationInterface {
  name = "CreateApiKeysTable1726145210000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE api_keys (
        id SERIAL PRIMARY KEY,
        kid VARCHAR(64) NOT NULL UNIQUE,
        secret_hash VARCHAR(128) NOT NULL,
        owner VARCHAR(200),
        allowed_ips TEXT,
        scopes TEXT,
        status VARCHAR(16) NOT NULL DEFAULT 'active',
        expires_at TIMESTAMPTZ,
        usage_count BIGINT NOT NULL DEFAULT 0,
        last_used TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_api_keys_kid ON api_keys(kid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_api_keys_kid;`);
    await queryRunner.query(`DROP TABLE IF EXISTS api_keys;`);
  }
}



