import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { unique: true })  // explicitly define type
  username!: string;

  @Column("varchar")
  password_hash!: string;

  @Column("varchar", { default: "admin" })
  role!: string;

  @CreateDateColumn()
  created_at!: Date;
}