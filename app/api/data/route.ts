import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { loadAll } from "@/lib/db/repo";

// Bootstrap endpoint: the client store calls this once on load.
// If the DB isn't configured, the client falls back to local storage.
export async function GET() {
  if (!dbConfigured()) {
    return NextResponse.json({ dbConfigured: false });
  }
  try {
    const data = await loadAll();
    return NextResponse.json({ dbConfigured: true, ...data });
  } catch (e) {
    return NextResponse.json(
      { dbConfigured: true, error: (e as Error).message },
      { status: 500 }
    );
  }
}
