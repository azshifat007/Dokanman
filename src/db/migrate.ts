import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function run() {
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!;
  console.log("Applying migrations to Neon database...");
  const sql = neon(dbUrl);
  const sqlFile = path.join(process.cwd(), "drizzle", "0000_organic_sway.sql");
  const sqlContent = fs.readFileSync(sqlFile, "utf-8");
  const statements = sqlContent.split("--> statement-breakpoint");

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (trimmed) {
      await sql.query(trimmed);
    }
  }
  console.log("Migration executed successfully!");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
