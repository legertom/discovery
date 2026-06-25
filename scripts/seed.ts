import "dotenv/config";
import { db } from "../lib/db";
import {
  opportunities,
  discoverySessions,
  discoverySteps,
} from "../lib/db/schema";
import { SEED_OPPORTUNITIES, SEED_SESSIONS, SEED_STEPS } from "../lib/seed";

async function main() {
  if (!db) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }
  await db.insert(opportunities).values(SEED_OPPORTUNITIES).onConflictDoNothing();
  await db.insert(discoverySessions).values(SEED_SESSIONS).onConflictDoNothing();
  await db.insert(discoverySteps).values(SEED_STEPS).onConflictDoNothing();
  console.log(
    `Seeded ${SEED_OPPORTUNITIES.length} opportunities, ${SEED_SESSIONS.length} sessions, ${SEED_STEPS.length} steps.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
