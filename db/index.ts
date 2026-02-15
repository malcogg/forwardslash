import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) {
  console.warn("DATABASE_URL or POSTGRES_URL not set - database features disabled");
}

export const db = connectionString ? drizzle(connectionString, { schema }) : null;
