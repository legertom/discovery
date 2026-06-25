import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { saveSettings } from "@/lib/db/repo";
import type { AppSettings } from "@/lib/types";

export async function POST(req: Request) {
  if (!dbConfigured())
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const body = (await req.json()) as AppSettings;
    await saveSettings(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
