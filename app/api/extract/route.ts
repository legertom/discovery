import { NextResponse } from "next/server";
import { generateObject } from "ai";
import {
  extractionSchema,
  buildExtractionPrompt,
  extractionToOpportunity,
} from "@/lib/extraction";

// Extraction can take a few seconds on a long transcript.
export const maxDuration = 60;

export async function POST(req: Request) {
  let transcript = "";
  try {
    ({ transcript } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!transcript || transcript.trim().length < 20) {
    return NextResponse.json(
      { error: "Paste a meeting summary or transcript (at least a few sentences)." },
      { status: 400 }
    );
  }

  try {
    const { object } = await generateObject({
      // Resolved through the Vercel AI Gateway (set AI_GATEWAY_API_KEY locally;
      // on Vercel, the Gateway uses OIDC automatically).
      model: "anthropic/claude-opus-4-8",
      schema: extractionSchema,
      prompt: buildExtractionPrompt(transcript),
    });
    return NextResponse.json(extractionToOpportunity(object));
  } catch (e) {
    const msg = (e as Error).message || "Extraction failed";
    const authish = /api key|gateway|unauthor|credential|token/i.test(msg);
    return NextResponse.json(
      {
        error: authish
          ? "AI Gateway is not configured. Set AI_GATEWAY_API_KEY in .env.local (or connect the Gateway on Vercel)."
          : msg,
      },
      { status: authish ? 503 : 500 }
    );
  }
}
