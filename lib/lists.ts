// Dropdown values + scoring weights. Mirrors the spreadsheet "Lists & Settings" tab.

export const TEAMS = [
  "Customer Support",
  "Customer Success",
  "Product",
  "Engineering",
  "Sales",
  "Marketing",
  "Operations",
  "People",
  "Finance",
  "Legal",
  "Security",
  "IT",
  "Leadership",
  "Other",
];

export const FREQUENCIES = [
  "Multiple times per day",
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Ad hoc",
  "Unknown",
] as const;

export const FRICTION_TYPES = [
  "Repetitive copy/paste",
  "Multi-system data gathering",
  "Manual reporting",
  "Writing or rewriting",
  "Summarizing or synthesizing information",
  "Searching for information",
  "Data cleanup or normalization",
  "Manual QA/checking",
  "Slow handoffs",
  "Inconsistent output quality",
  "Error-prone process",
  "Customer-facing delay",
  "Internal decision delay",
  "Compliance/privacy concern",
  "Other",
];

export const SOLUTION_TYPES = [
  "AI-assisted writing",
  "AI-assisted summarization",
  "AI-assisted research/retrieval",
  "Reporting automation",
  "Data pipeline/integration",
  "Workflow automation",
  "Template/process redesign",
  "Knowledge management improvement",
  "Human-in-the-loop review process",
  "Not enough information",
  "Not a fit",
] as const;

export const STATUSES = [
  "New",
  "Needs Discovery",
  "Discovery Scheduled",
  "Discovery Complete",
  "Prototype Candidate",
  "In Prototype",
  "Implemented",
  "Parked",
  "Not a Fit",
] as const;

export const RISK_LEVELS = ["Low", "Medium", "High", "Unknown"] as const;
export const FEASIBILITIES = ["Easy", "Medium", "Hard", "Unknown"] as const;

export const PRIORITY_CATEGORIES = [
  "Quick Win",
  "Discovery Needed",
  "Strategic Project",
  "High Risk / Needs Review",
  "Not a Fit",
  "Process Issue",
] as const;

export const SESSION_TYPES = [
  "Intake Review",
  "Live Workflow Walkthrough",
  "Stakeholder Interview",
  "Async Review",
  "Prototype Scoping",
  "Follow-up",
] as const;

export const TIMELINES = [
  "This week",
  "This month",
  "This quarter",
  "No specific timeline",
] as const;

export const YES_NO_UNSURE = ["Yes", "No", "Unsure"] as const;
export const YES_NO_MAYBE = ["Yes", "No", "Maybe"] as const;
export const JUDGMENT_OPTS = ["Yes", "No", "Sometimes", "Unknown"] as const;
export const AUTO_OPTS = ["Yes", "No", "Partially", "Unknown"] as const;

// Scoring weights — adjustable, default to spreadsheet values.
export const SCORING_WEIGHTS = {
  impact: 2,
  frequency: 1,
  pain: 2,
  feasibility: 1,
  riskPenalty: 2,
};

// Default editable settings (label lists + weights). Used as the fallback when
// the DB has no settings row yet.
import type { AppSettings } from "./types";

export function defaultSettings(): AppSettings {
  return {
    teams: [...TEAMS],
    frictionTypes: [...FRICTION_TYPES],
    statuses: [...STATUSES],
    solutionTypes: [...SOLUTION_TYPES],
    weights: { ...SCORING_WEIGHTS },
  };
}
