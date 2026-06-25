import { z } from "zod";
import type { Opportunity } from "./types";
import {
  TEAMS,
  FREQUENCIES,
  FRICTION_TYPES,
  TIMELINES,
} from "./lists";

// The intake questions an interview is meant to answer. Used both to guide
// extraction and to report which ones went unanswered.
export const INTAKE_QUESTIONS = [
  "Workflow or task name",
  "Team / function",
  "Who owns this workflow?",
  "Who is involved in doing this workflow?",
  "Who uses the output of this workflow?",
  "What is the purpose of this workflow?",
  "What decision, deliverable, or outcome does it support?",
  "What happens if this work is late, wrong, or skipped?",
  "Briefly describe the current process",
  "How often does this happen?",
  "About how many minutes does it take each time?",
  "How many people do this work?",
  "How many outputs/items are created each cycle?",
  "Which systems/tools are involved?",
  "How many distinct systems/tools are involved?",
  "What kind of friction does this workflow create?",
  "How painful is this today (1-5)?",
  "How business-critical is this (1-5)?",
  "How error-prone is this (1-5)?",
  "How urgent is it to improve (1-5)?",
  "How many internal people are affected?",
  "How many customers/districts/students are affected?",
  "What would 'better' look like?",
  "What should still require human review?",
  "What should never be automated?",
  "What would make you trust the improved workflow?",
  "What would make this unusable?",
  "How would we know this worked?",
  "Does this involve sensitive data?",
  "What data types are involved?",
  "Where does the input data live?",
  "Where does the output go?",
  "Are there existing reports, exports, or templates?",
  "Ideal timeline",
];

const CONFIDENCE = ["stated", "inferred", "missing"] as const;

// A field carries the extracted value, how confident we are, and a supporting quote.
const textField = z.object({
  value: z.string(),
  confidence: z.enum(CONFIDENCE),
  evidence: z.string(),
});
const numField = z.object({
  value: z.number(),
  confidence: z.enum(CONFIDENCE),
  evidence: z.string(),
});
const enumField = <T extends readonly [string, ...string[]]>(vals: T) =>
  z.object({
    value: z.enum(vals),
    confidence: z.enum(CONFIDENCE),
    evidence: z.string(),
  });

export const extractionSchema = z.object({
  fields: z.object({
    workflowName: textField,
    team: enumField(TEAMS as [string, ...string[]]),
    workflowOwner: textField,
    peopleInvolved: textField,
    whoUsesOutput: textField,
    purpose: textField,
    decisionSupported: textField,
    whatHappensIfLate: textField,
    currentProcess: textField,
    frequency: enumField(FREQUENCIES as unknown as [string, ...string[]]),
    minutesPerRun: numField,
    peopleDoingWork: numField,
    outputsPerCycle: textField,
    systemsInvolved: textField,
    numberOfSystems: numField,
    frictionTypes: z.object({
      value: z.array(z.enum(FRICTION_TYPES as [string, ...string[]])),
      confidence: z.enum(CONFIDENCE),
      evidence: z.string(),
    }),
    painRating: numField,
    businessCriticality: numField,
    errorProneness: numField,
    urgency: numField,
    peopleAffected: numField,
    customersAffected: textField,
    desiredFutureState: textField,
    humanReview: textField,
    neverAutomate: textField,
    trust: textField,
    unusable: textField,
    howWouldWeKnow: textField,
    sensitiveData: enumField(["Yes", "No", "Unsure"]),
    dataTypes: textField,
    inputDataLocation: textField,
    outputDestination: textField,
    existingReports: textField,
    idealTimeline: enumField([...TIMELINES, ""] as unknown as [string, ...string[]]),
  }),
  unansweredQuestions: z.array(z.string()),
  summary: z.string(),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;

export function buildExtractionPrompt(transcript: string): string {
  return `You are helping a program manager run an "AI Enablement" workflow-friction intake. Below is a transcript or meeting summary from an intake interview about a painful/manual workflow.

Extract the structured intake fields from it. Critical rules:
- Capture the WORKFLOW and its FRICTION, not a proposed AI solution.
- For each field, set "confidence" to:
  - "stated" if the interview explicitly answered it,
  - "inferred" if you reasonably inferred it from context,
  - "missing" if there is no basis for it (use a sensible default value but mark it missing).
- "evidence" must be a short direct quote or paraphrase from the transcript supporting the value. Leave it empty when confidence is "missing".
- For 1-5 ratings, only use "stated"/"inferred" if the interview gives a basis; otherwise default to 3 and mark "missing".
- For "frictionTypes", choose only from the allowed categories that clearly apply.
- In "unansweredQuestions", list the intake questions (from the set below) that the interview did NOT answer, so the program manager knows what to follow up on.
- "summary" is a 2-3 sentence plain-language recap of the workflow and its pain.

Intake questions this interview was meant to cover:
${INTAKE_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n")}

--- TRANSCRIPT / SUMMARY ---
${transcript}
--- END ---`;
}

// Map an extraction result into a partial Opportunity plus confidence/evidence maps.
export function extractionToOpportunity(r: ExtractionResult) {
  const f = r.fields;
  const patch: Partial<Opportunity> = {
    workflowName: f.workflowName.value,
    team: f.team.value,
    workflowOwner: f.workflowOwner.value,
    peopleInvolved: f.peopleInvolved.value,
    whoUsesOutput: f.whoUsesOutput.value,
    purpose: f.purpose.value,
    decisionSupported: f.decisionSupported.value,
    whatHappensIfLate: f.whatHappensIfLate.value,
    currentProcess: f.currentProcess.value,
    frequency: f.frequency.value as Opportunity["frequency"],
    minutesPerRun: f.minutesPerRun.value,
    peopleDoingWork: f.peopleDoingWork.value,
    outputsPerCycle: f.outputsPerCycle.value,
    systemsInvolved: f.systemsInvolved.value,
    numberOfSystems: f.numberOfSystems.value,
    frictionTypes: f.frictionTypes.value,
    painRating: f.painRating.value,
    businessCriticality: f.businessCriticality.value,
    errorProneness: f.errorProneness.value,
    urgency: f.urgency.value,
    peopleAffected: f.peopleAffected.value,
    customersAffected: f.customersAffected.value,
    desiredFutureState: f.desiredFutureState.value,
    humanReview: f.humanReview.value,
    neverAutomate: f.neverAutomate.value,
    trust: f.trust.value,
    unusable: f.unusable.value,
    howWouldWeKnow: f.howWouldWeKnow.value,
    sensitiveData: f.sensitiveData.value as Opportunity["sensitiveData"],
    dataTypes: f.dataTypes.value,
    inputDataLocation: f.inputDataLocation.value,
    outputDestination: f.outputDestination.value,
    existingReports: f.existingReports.value,
    idealTimeline: f.idealTimeline.value as Opportunity["idealTimeline"],
  };

  const confidence: Record<string, string> = {};
  const evidence: Record<string, string> = {};
  for (const [k, v] of Object.entries(f)) {
    const fld = v as { confidence: string; evidence: string };
    confidence[k] = fld.confidence;
    evidence[k] = fld.evidence;
  }

  return {
    patch,
    confidence,
    evidence,
    unansweredQuestions: r.unansweredQuestions,
    summary: r.summary,
  };
}
