import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// 👉 Define the enum in TypeScript
export enum ParamType {
  NUMBER = "Number",
  STRING = "String",
  DATE = "Date",
}

@Entity({ name: "params" }) // table name = params
export class Params {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  param!: string;

  // 👇 Enum column mapped to PostgreSQL enum type
  @Column({
    type: "enum",
    enum: ParamType,
    nullable: false,
  })
  type!: ParamType;

  @Column({ type: "int", nullable: true })
  intvalue!: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  stringvalue!: string | null;
}