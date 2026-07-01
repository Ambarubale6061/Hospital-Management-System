import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

const dbUrl = process.env.SUPABASE_DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Copy it from your Supabase project: " +
      "Project Settings -> Database -> Connection string (URI, with pgbouncer/pooler for serverless, or direct for long-lived servers)."
  );
}

if (dbUrl.includes("[YOUR-PASSWORD]") || dbUrl.includes("[password]")) {
  throw new Error(
    "SUPABASE_DATABASE_URL still contains the placeholder password. Replace [YOUR-PASSWORD] with your actual Supabase database password."
  );
}

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

export * from "./schema/index.js";
