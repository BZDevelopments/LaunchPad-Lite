#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

const RESET = "\x1b[0m", RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", CYAN = "\x1b[36m", BOLD = "\x1b[1m";

function fail(lines) {
  console.error(`\n${RED}${BOLD}✗ Database connection check failed${RESET}\n`);
  for (const line of lines) console.error("  " + line);
  console.error("");
  process.exit(1);
}

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  fail([
    `${YELLOW}DATABASE_URL${RESET} (and/or ${YELLOW}DIRECT_URL${RESET}) is not set in .env.local.`,
    "",
    "1. Copy .env.example → .env.local (if you haven't already)",
    "2. Set DATABASE_URL to your real database connection string",
    "3. Re-run this command",
  ]);
}

if (directUrl.includes("user:password@localhost")) {
  fail([
    `${YELLOW}DATABASE_URL${RESET} is still the placeholder value from .env.example:`,
    `  ${directUrl}`,
    "",
    "Replace it with your actual connection string from Neon, Supabase, Railway, etc.",
    `See: ${CYAN}docs/ENVIRONMENT_VARIABLES.md${RESET}`,
  ]);
}

console.log(`${BOLD}${CYAN}⚡ Checking database connection...${RESET}`);

let postgres;
try {
  postgres = require("postgres");
} catch {
  fail(["Could not load the 'postgres' package.", "Run: npm install"]);
}

const sql = postgres(directUrl, { connect_timeout: 8, max: 1, prepare: false });

sql`select 1`
  .then(() => {
    console.log(`${GREEN}✓ Connected successfully.${RESET}\n`);
    return sql.end();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    const msg = err && err.message ? err.message : String(err);
    const code = err && err.code ? err.code : null;
    const hints = [];

    if (code === "CONNECT_TIMEOUT" || /timeout/i.test(msg)) {
      hints.push(
        "Connection timed out. Common causes:",
        "  • Your database project is paused (check your provider's dashboard)",
        "  • You're using a hostname that requires IPv6 — try the pooled",
        "    connection string instead (e.g. Supabase's pooler.supabase.com host)",
        "  • A firewall is blocking outbound Postgres connections"
      );
    } else if (/password authentication failed/i.test(msg)) {
      hints.push("Password authentication failed — double-check your connection string's password.");
    } else if (/ENOTFOUND|EAI_AGAIN/i.test(msg)) {
      hints.push(
        "The hostname could not be resolved (DNS failure).",
        "On Supabase: use the POOLER hostname (aws-0-<region>.pooler.supabase.com),",
        "not the old db.<project>.supabase.co host, which is often unreachable."
      );
    } else if (/does not exist/i.test(msg) && /database/i.test(msg)) {
      hints.push("The database name in your connection string doesn't exist.");
    } else {
      hints.push("Raw error below — check your connection string is complete and correct.");
    }

    fail([`${RED}${msg}${RESET}`, "", ...hints, "", `Connection string used (password hidden): ${redact(directUrl)}`]);
  });

function redact(url) {
  try {
    const u = new URL(url);
    if (u.password) u.password = "****";
    return u.toString();
  } catch {
    return url.replace(/:[^:@]+@/, ":****@");
  }
}
