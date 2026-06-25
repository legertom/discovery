import { eq } from "drizzle-orm";
import { db } from "./index";
import { opportunities, discoverySessions, discoverySteps } from "./schema";
import type { Opportunity, DiscoverySession, DiscoveryStep } from "../types";

// All functions assume db is configured; callers (API routes) check dbConfigured() first.
function requireDb() {
  if (!db) throw new Error("DATABASE_URL is not configured");
  return db;
}

const stripMeta = <T extends { createdAt?: unknown }>(row: T) => {
  const { createdAt, ...rest } = row;
  void createdAt;
  return rest;
};

// ---- Opportunities ----
export async function listOpportunities(): Promise<Opportunity[]> {
  const rows = await requireDb().select().from(opportunities);
  return rows.map(stripMeta) as Opportunity[];
}

export async function createOpportunity(o: Opportunity): Promise<Opportunity> {
  await requireDb().insert(opportunities).values(o);
  return o;
}

export async function updateOpportunity(
  id: string,
  patch: Partial<Opportunity>
): Promise<void> {
  await requireDb().update(opportunities).set(patch).where(eq(opportunities.id, id));
}

export async function deleteOpportunity(id: string): Promise<void> {
  await requireDb().delete(opportunities).where(eq(opportunities.id, id));
}

// ---- Discovery sessions ----
export async function listSessions(): Promise<DiscoverySession[]> {
  const rows = await requireDb().select().from(discoverySessions);
  return rows.map(stripMeta) as DiscoverySession[];
}

export async function createSession(s: DiscoverySession): Promise<DiscoverySession> {
  await requireDb().insert(discoverySessions).values(s);
  return s;
}

export async function updateSession(
  id: string,
  patch: Partial<DiscoverySession>
): Promise<void> {
  await requireDb().update(discoverySessions).set(patch).where(eq(discoverySessions.id, id));
}

export async function deleteSession(id: string): Promise<void> {
  await requireDb().delete(discoverySessions).where(eq(discoverySessions.id, id));
}

// ---- Discovery steps ----
export async function listSteps(): Promise<DiscoveryStep[]> {
  const rows = await requireDb().select().from(discoverySteps);
  return rows.map(stripMeta) as DiscoveryStep[];
}

export async function createStep(s: DiscoveryStep): Promise<DiscoveryStep> {
  await requireDb().insert(discoverySteps).values(s);
  return s;
}

export async function updateStep(
  id: string,
  patch: Partial<DiscoveryStep>
): Promise<void> {
  await requireDb().update(discoverySteps).set(patch).where(eq(discoverySteps.id, id));
}

export async function deleteStep(id: string): Promise<void> {
  await requireDb().delete(discoverySteps).where(eq(discoverySteps.id, id));
}

// Bulk load for the client store.
export async function loadAll() {
  const [opps, sessions, steps] = await Promise.all([
    listOpportunities(),
    listSessions(),
    listSteps(),
  ]);
  return { opportunities: opps, sessions, steps };
}
