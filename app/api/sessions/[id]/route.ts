import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { updateSession, deleteSession } from "@/lib/db/repo";
import type { DiscoverySession } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!dbConfigured())
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const patch = (await req.json()) as Partial<DiscoverySession>;
    await updateSession(id, patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!dbConfigured())
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const { id } = await params;
    await deleteSession(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
