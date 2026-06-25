import { z } from "zod";

// One current-state workflow step, mapped from rough discovery notes.
const stepSchema = z.object({
  stepNumber: z.number(),
  stepDescription: z.string(),
  toolSystem: z.string(),
  input: z.string(),
  output: z.string(),
  manualAction: z.string(),
  timeSpent: z.string(),
  painObserved: z.string(),
  errorRiskPoint: z.string(),
  humanJudgment: z.enum(["Yes", "No", "Sometimes", "Unknown"]),
  couldBeAutomated: z.enum(["Yes", "No", "Partially", "Unknown"]),
  couldBeAiAssisted: z.enum(["Yes", "No", "Partially", "Unknown"]),
  dependency: z.string(),
  notes: z.string(),
});

export const stepsExtractionSchema = z.object({
  steps: z.array(stepSchema),
  summary: z.string(),
});

export type StepsExtraction = z.infer<typeof stepsExtractionSchema>;
export type ExtractedStep = z.infer<typeof stepSchema>;

export function buildStepsPrompt(transcript: string): string {
  return `You are helping a program manager map a CURRENT-STATE workflow from rough notes taken during a live discovery walkthrough. Convert the notes below into an ordered list of discrete workflow steps.

Rules:
- One step per discrete action the person takes (open a system, apply a filter, export a report, copy a value, plug into a sheet, etc.). Split compound notes into separate steps. Keep them in the order performed.
- Capture the CURRENT state — what the person actually does — not a proposed solution.
- For each step set:
  - "stepDescription": the action, concise and concrete.
  - "toolSystem": the system/app/document used (e.g. Salesforce, TalkDesk, Assembled, Rippling, Google Docs, efficiency sheet). "" if none.
  - "input": what enters the step (a filter, a report, a value). "" if unclear.
  - "output": what the step produces or changes. "" if unclear.
  - "manualAction": the literal manual work — copy, paste, filter, export, reset date, look up, plug in, etc.
  - "timeSpent": only if the notes state or strongly imply it; otherwise "".
  - "painObserved": friction explicitly noted (e.g. "Rippling defaults to Nov 2024", "rebuild filters each time", "repeat for every person"). "" if none.
  - "errorRiskPoint": where a mistake, stale data, or rework could occur. "" if none.
  - "humanJudgment": does this step need human interpretation/judgment? Yes/No/Sometimes/Unknown.
  - "couldBeAutomated": could deterministic automation do this? Yes/No/Partially/Unknown.
  - "couldBeAiAssisted": could AI assist (retrieval, summarizing, transformation, copy)? Yes/No/Partially/Unknown.
  - "dependency": access/integration needed to improve this step (API, permissions, a report). "" if none.
  - "notes": anything else useful. "" if none.
- "stepNumber" is the 1-based order.
- Be thoughtful and specific on the Yes/No assessments — mechanical copy/paste and exports are usually automatable; steps requiring interpretation usually need human judgment.
- "summary": 1-2 sentences describing the overall workflow and its biggest friction.

--- DISCOVERY NOTES / TRANSCRIPT ---
${transcript}
--- END ---`;
}
