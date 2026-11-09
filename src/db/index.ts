import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

if (typeof window === "undefined") {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
}

function getDb() {
  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is not defined");
  }
  const client = neon(connectionString);
  return drizzle(client, { schema });
}

export const db = getDb();
export { schema };
