import "reflect-metadata";
import { DataSource } from "typeorm";
import { Customer } from "./entity/Customers";
import * as path from "path";
import { Params } from "./entity/Params";
import { ApiKey } from "./entity/ApiKey";
import { Admin } from "./entity/Admin";


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "",
  port: Number(process.env.POSTGRES_PORT), // default port for PostgreSQL
  username: process.env.POSTGRES_USER || "",   // change if needed
  password: process.env.POSTGRES_PASSWORD || "", 
  database: process.env.POSTGRES_DB || "", 
  entities: [ 
    Customer,
    Params,
    ApiKey,
    Admin
  ],
  migrations: [
    path.join(__dirname, "migrations/*{.ts,.js}")  // 👈 works in dev & prod
  ],
  synchronize: false,     // keep false in production
  logging: true, 
});
