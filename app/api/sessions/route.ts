import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { createSession } from "@/lib/db/repo";
import type { DiscoverySession } from "@/lib/types";

export async function POST(req: Request) {
  if (!dbConfigured())
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const body = (await req.json()) as DiscoverySession;
    const saved = await createSession(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
