// Runs DB migration on startup — called by migrate service in docker-compose
import postgres from "postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

const migration = readFileSync(join(__dirname, "../migrations/001_init.sql"), "utf8");

try {
  await sql.unsafe(migration);
  console.log("[migrate] ✓ Migration applied successfully");
} catch (err) {
  console.error("[migrate] ✗ Migration failed:", err.message);
  process.exit(1);
} finally {
  await sql.end();
}
