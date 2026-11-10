import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// Drizzle migrations are not written idempotently, so statements that already exist
// (e.g. from an earlier `drizzle-kit push`) are skipped instead of aborting the run.
const IGNORABLE_PG_CODES = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (type / constraint)
  "42701", // duplicate_column
  "42P16", // invalid_table_definition (constraint already present)
]);

interface JournalEntry {
  idx: number;
  tag: string;
}

function readJournal(): JournalEntry[] {
  const journalPath = path.join(process.cwd(), "drizzle", "meta", "_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8")) as {
    entries: JournalEntry[];
  };
  return journal.entries || [];
}

async function run() {
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is not defined");
  }

  console.log("Applying migrations to Neon database...");
  const sql = neon(dbUrl);

  const entries = readJournal();
  if (entries.length === 0) {
    console.log("No migrations found in drizzle/meta/_journal.json");
    return;
  }

  for (const entry of entries) {
    const sqlFile = path.join(process.cwd(), "drizzle", `${entry.tag}.sql`);
    if (!fs.existsSync(sqlFile)) {
      console.warn(`Skipping missing migration file: ${entry.tag}.sql`);
      continue;
    }

    const statements = fs
      .readFileSync(sqlFile, "utf-8")
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`→ ${entry.tag} (${statements.length} statements)`);

    for (const statement of statements) {
      try {
        await sql.query(statement);
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code && IGNORABLE_PG_CODES.has(code)) {
          console.log(`  · already applied, skipping (${code})`);
          continue;
        }
        throw err;
      }
    }
  }

  console.log("Migration executed successfully!");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
