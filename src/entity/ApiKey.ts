// src/entity/ApiKey.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
  } from "typeorm";

  export enum ApiKeyStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    REVOKED = "revoked",
  }
  
  @Entity({ name: "api_keys" })
  export class ApiKey {
    // numeric PK
    @PrimaryGeneratedColumn()
    id!: number;
  
    // key id (short opaque id) exposed in API key string
    @Index({ unique: true })
    @Column({ type: "varchar", length: 64 })
    kid!: string;
  
    // hash of secret (HMAC-SHA256)
    @Column({ type: "varchar", length: 128 })
    secret_hash!: string;
  
    // optional owner name (partner name)
    @Column({ type: "varchar", length: 200, nullable: true })
    owner?: string;
  
    // JSON array of allowed IPs or CIDRs (nullable)
    @Column({ type: "text", nullable: true })
    allowed_ips?: string | null;
  
    // optional scopes or permissions
    @Column({ type: "text", nullable: true })
    scopes?: string | null;
  
    @Column({
      type: "enum",
      enum: ApiKeyStatus,
      default: ApiKeyStatus.ACTIVE,
    })
    status!: ApiKeyStatus;
  
    @Column({ type: "timestamp with time zone", nullable: true })
    expires_at?: Date | null;
  
    @Column({ type: "bigint", default: 0 })
    usage_count!: string | number;
  
    @Column({ type: "timestamp with time zone", nullable: true })
    last_used?: Date | null;
  
    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at!: Date;
  
    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at!: Date;
  }

// allowed_ips can store JSON like ["1.2.3.4/32"] or ["203.0.113.0/24"].
// usage_count stored as bigint for scale.

