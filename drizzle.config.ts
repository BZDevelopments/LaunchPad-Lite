import { defineConfig } from "drizzle-kit";
import * as fs from "fs";
import * as path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

// drizzle-kit needs a DIRECT connection to introspect schema — pooled
// connections (Supabase/Neon pooler) don't support this and fail with a
// silent, unhelpful error. DATABASE_URL (pooled) is for the running app;
// DIRECT_URL (direct) is for this file only. Falls back to DATABASE_URL
// if your provider has no separate pooler.
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  console.error("\n❌  DATABASE_URL is not set.");
  console.error("   1. Copy .env.example → .env.local");
  console.error("   2. Set DATABASE_URL=postgresql://user:password@host:5432/dbname");
  console.error("      (and DIRECT_URL if your provider gives a separate pooled/direct pair)");
  console.error("   3. Re-run this command\n");
  process.exit(1);
}

if (directUrl.includes("user:password@localhost")) {
  console.error("\n❌  DATABASE_URL is still the placeholder value from .env.example.");
  console.error(`   Current value: ${directUrl}`);
  console.error("   Replace it with your actual connection string.\n");
  process.exit(1);
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/engine/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: directUrl },
  verbose: true,
  strict: true,
});
