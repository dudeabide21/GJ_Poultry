// lib/db.js
import { Pool } from "pg";

let pool;

// On Vercel every invocation may spin up a fresh process,
// so we attach the pool to the global object to reuse it.
if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}
pool = global.pgPool;

export default pool;
