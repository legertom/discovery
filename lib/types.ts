// Core domain types for the AI Enablement intake & triage system.

export type YesNoUnsure = "Yes" | "No" | "Unsure";
export type YesNoMaybe = "Yes" | "No" | "Maybe";

export type Frequency =
  | "Multiple times per day"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Ad hoc"
  | "Unknown";

export type Status =
  | "New"
  | "Needs Discovery"
  | "Discovery Scheduled"
  | "Discovery Complete"
  | "Prototype Candidate"
  | "In Prototype"
  | "Implemented"
  | "Parked"
  | "Not a Fit";

export type RiskLevel = "Low" | "Medium" | "High" | "Unknown";
export type Feasibility = "Easy" | "Medium" | "Hard" | "Unknown";

export type PriorityCategory =
  | "Quick Win"
  | "Discovery Needed"
  | "Strategic Project"
  | "High Risk / Needs Review"
  | "Not a Fit"
  | "Process Issue";

export type SolutionType =
  | "AI-assisted writing"
  | "AI-assisted summarization"
  | "AI-assisted research/retrieval"
  | "Reporting automation"
  | "Data pipeline/integration"
  | "Workflow automation"
  | "Template/process redesign"
  | "Knowledge management improvement"
  | "Human-in-the-loop review process"
  | "Not enough information"
  | "Not a fit"
  | "";

export type SessionType =
  | "Intake Review"
  | "Live Workflow Walkthrough"
  | "Stakeholder Interview"
  | "Async Review"
  | "Prototype Scoping"
  | "Follow-up";

export type Timeline =
  | "This week"
  | "This month"
  | "This quarter"
  | "No specific timeline"
  | "";

// Intake — the raw submission. Mirrors the spreadsheet "Intake Responses" tab.
export interface Opportunity {
  id: string; // WF-0001
  submittedDate: string; // ISO date
  submittedBy: string;
  team: string;
  workflowName: string;
  workflowOwner: string;
  peopleInvolved: string;
  whoUsesOutput: string;
  purpose: string;
  decisionSupported: string;
  whatHappensIfLate: string;
  currentProcess: string;
  frequency: Frequency;
  minutesPerRun: number;
  peopleDoingWork: number;
  outputsPerCycle: string;
  systemsInvolved: string;
  numberOfSystems: number;
  frictionTypes: string[];
  painRating: number; // 1-5
  businessCriticality: number; // 1-5
  errorProneness: number; // 1-5
  urgency: number; // 1-5
  peopleAffected: number;
  customersAffected: string;
  desiredFutureState: string;
  humanReview: string;
  neverAutomate: string;
  trust: string;
  unusable: string;
  howWouldWeKnow: string;
  sensitiveData: YesNoUnsure;
  dataTypes: string;
  inputDataLocation: string;
  outputDestination: string;
  existingReports: string;
  exampleLink: string;
  availableForWalkthrough: YesNoMaybe;
  prototypeWillingness: YesNoMaybe;
  idealTimeline: Timeline;
  initialNotes: string;

  // Manual triage fields (set on the Opportunity Scoring tab)
  status: Status;
  likelySolutionType: SolutionType;
  feasibility: Feasibility;
  riskLevel: RiskLevel;
  assignee: string;
  nextReviewDate: string;
  triageNotes: string;
}

export interface DiscoverySession {
  id: string; // DS-0001
  opportunityId: string;
  sessionDate: string;
  facilitator: string;
  workflowOwnerSme: string;
  sessionType: SessionType;
  sessionGoal: string;
  summaryLearned: string;
  keyPainPoints: string;
  risksGuardrails: string;
  dependencies: string;
  likelySolutionDirection: SolutionType;
  recommendedNextStep: string;
  ownerOfNextStep: string;
  nextReviewDate: string;
  notes: string;
}

export interface DiscoveryStep {
  id: string;
  opportunityId: string;
  sessionId: string;
  stepNumber: number;
  stepDescription: string;
  toolSystem: string;
  input: string;
  output: string;
  manualAction: string;
  timeSpent: string;
  painObserved: string;
  errorRiskPoint: string;
  humanJudgment: "Yes" | "No" | "Sometimes" | "Unknown";
  couldBeAutomated: "Yes" | "No" | "Partially" | "Unknown";
  couldBeAiAssisted: "Yes" | "No" | "Partially" | "Unknown";
  dependency: string;
  notes: string;
}

// Editable settings: label lists + scoring weights. Persisted in the DB.
export interface ScoringWeights {
  impact: number;
  frequency: number;
  pain: number;
  feasibility: number;
  riskPenalty: number;
}

export interface AppSettings {
  teams: string[];
  frictionTypes: string[];
  statuses: string[];
  solutionTypes: string[];
  weights: ScoringWeights;
}

// Derived scoring values, computed from an Opportunity.
export interface Score {
  estRunsPerMonth: number;
  estMonthlyHours: number;
  annualizedHours: number;
  impactScore: number;
  frequencyScore: number;
  frictionScore: number;
  riskPenalty: number;
  priorityScore: number;
  priorityCategory: PriorityCategory | "";
  recommendedNextStep: string;
}
