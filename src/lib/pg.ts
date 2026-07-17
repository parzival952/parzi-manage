// Client Postgres (Supabase) — utilisé quand DATABASE_URL est définie.
// postgres.js : pur JavaScript, pas de binaire natif.
import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

export function pg() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquante");
  _sql = postgres(url, {
    ssl: "require",
    prepare: false, // requis avec le pooler Supabase en mode transaction
    max: 5,
  });
  return _sql;
}

export const usePostgres = () => Boolean(process.env.DATABASE_URL);
