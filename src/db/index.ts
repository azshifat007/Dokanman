import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// Next.js loads .env files itself; dotenv is only needed for standalone tsx
// scripts. Skipping it in production avoids dotenv's stderr banner polluting
// deployed logs on every cold start.
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local", quiet: true });
  dotenv.config({ path: ".env", quiet: true });
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
