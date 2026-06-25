import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { createStep } from "@/lib/db/repo";
import type { DiscoveryStep } from "@/lib/types";

export async function POST(req: Request) {
  if (!dbConfigured())
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const body = (await req.json()) as DiscoveryStep;
    const saved = await createStep(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
