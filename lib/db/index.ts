import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Neon serverless HTTP driver. DATABASE_URL is set in the environment
// (locally via .env.local, on Vercel via the Neon integration).
// When unset, `db` is null and API routes report that the DB isn't configured
// so the client can fall back to local storage.

const url = process.env.DATABASE_URL;

export const db = url ? drizzle(neon(url), { schema }) : null;

export function dbConfigured(): boolean {
  return db !== null;
}

export { schema };
