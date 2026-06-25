import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { stepsExtractionSchema, buildStepsPrompt } from "@/lib/stepExtraction";

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
      { error: "Paste your discovery notes or transcript (at least a few sentences)." },
      { status: 400 }
    );
  }

  try {
    const { object } = await generateObject({
      model: "anthropic/claude-opus-4-8",
      schema: stepsExtractionSchema,
      prompt: buildStepsPrompt(transcript),
    });
    return NextResponse.json(object);
  } catch (e) {
    const msg = (e as Error).message || "Extraction failed";
    const authish = /api key|gateway|unauthor|credential|free tier|credits/i.test(msg);
    return NextResponse.json(
      {
        error: authish
          ? "AI Gateway is not configured or out of credits. Check the AI Gateway settings on Vercel."
          : msg,
      },
      { status: authish ? 503 : 500 }
    );
  }
}
