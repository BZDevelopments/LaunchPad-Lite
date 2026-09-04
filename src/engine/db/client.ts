import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { connection: postgres.Sql | undefined };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    [
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "  ❌  DATABASE_URL is not set",
      "",
      "  1. Copy .env.example → .env.local",
      "  2. Set DATABASE_URL=postgresql://user:password@host/db",
      "  3. Restart the dev server",
      "",
      "  On Supabase/Neon: DATABASE_URL should be the POOLED connection",
      "  string. Schema tools (drizzle-kit) use a separate DIRECT_URL —",
      "  see drizzle.config.ts and docs/ENVIRONMENT_VARIABLES.md.",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ].join("\n")
  );
}

if (connectionString.includes("user:password@localhost")) {
  throw new Error(
    [
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "  ❌  DATABASE_URL is still the placeholder from .env.example",
      "",
      `  Current value: ${connectionString}`,
      "  Replace it with your real connection string, then run",
      "  `npm run db:push` to create your tables.",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ].join("\n")
  );
}

const connection =
  globalForDb.connection ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.connection = connection;
}

export const db = drizzle(connection, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export type Database = typeof db;
