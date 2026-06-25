import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { createOpportunity } from "@/lib/db/repo";
import type { Opportunity } from "@/lib/types";

export async function POST(req: Request) {
  if (!dbConfigured())
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const body = (await req.json()) as Opportunity;
    const saved = await createOpportunity(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
