import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "customers" }) // match your table name
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  country?: string;
}

