import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
const isRealSupabaseUrl =
  supabaseUrl &&
  !supabaseUrl.includes("[YOUR-PASSWORD]") &&
  !supabaseUrl.includes("[password]");
const dbUrl = (isRealSupabaseUrl ? supabaseUrl : null) || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL must be set");
}

export default defineConfig({
  schema: "./src/schema/*", 
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
