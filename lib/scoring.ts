// Scoring engine — direct port of the spreadsheet "Opportunity Scoring" formulas.

import type { Opportunity, Score, PriorityCategory } from "./types";

function runsPerMonth(frequency: string): number {
  switch (frequency) {
    case "Multiple times per day":
      return 60;
    case "Daily":
      return 20;
    case "Weekly":
      return 4;
    case "Monthly":
      return 1;
    case "Quarterly":
      return 0.33;
    case "Ad hoc":
      return 0.5;
    default:
      return 0; // Unknown
  }
}

function frequencyScore(frequency: string): number {
  switch (frequency) {
    case "Multiple times per day":
      return 5;
    case "Daily":
      return 4;
    case "Weekly":
      return 3;
    case "Monthly":
      return 2;
    case "Quarterly":
      return 1;
    case "Ad hoc":
      return 1;
    default:
      return 0;
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeScore(o: Opportunity): Score {
  const estRunsPerMonth = runsPerMonth(o.frequency);
  const estMonthlyHours = round1(
    (o.minutesPerRun * o.peopleDoingWork * estRunsPerMonth) / 60
  );
  const annualizedHours = round1(estMonthlyHours * 12);

  // Impact: avg(criticality, urgency) + time-cost bonus, capped at 5
  let timeBonus = 0;
  if (estMonthlyHours >= 20) timeBonus = 2;
  else if (estMonthlyHours >= 10) timeBonus = 1.5;
  else if (estMonthlyHours >= 5) timeBonus = 1;
  else if (estMonthlyHours >= 1) timeBonus = 0.5;
  const impactScore = Math.min(
    5,
    round1((o.businessCriticality + o.urgency) / 2 + timeBonus)
  );

  const freqScore = frequencyScore(o.frequency);
  const frictionScore = round1((o.painRating + o.errorProneness) / 2);

  // Risk penalty: from risk level + sensitive data
  let riskBase = 1;
  if (o.riskLevel === "High") riskBase = 3;
  else if (o.riskLevel === "Medium") riskBase = 2;
  else if (o.riskLevel === "Low") riskBase = 0;
  else if (o.riskLevel === "Unknown") riskBase = 1;
  let sensitiveAdd = 0;
  if (o.sensitiveData === "Yes") sensitiveAdd = 2;
  else if (o.sensitiveData === "Unsure") sensitiveAdd = 1;
  const riskPenalty = riskBase + sensitiveAdd;

  // Feasibility modifier
  let feasMod = 0;
  if (o.feasibility === "Easy") feasMod = 2;
  else if (o.feasibility === "Medium") feasMod = 1;
  else if (o.feasibility === "Hard") feasMod = -1;

  const priorityScore = round1(
    impactScore * 2 +
      freqScore * 1 +
      frictionScore * 2 +
      feasMod -
      riskPenalty * 2
  );

  // Priority category
  let priorityCategory: PriorityCategory | "" = "";
  if (o.likelySolutionType === "Not a fit") {
    priorityCategory = "Not a Fit";
  } else if (riskPenalty >= 5) {
    priorityCategory = "High Risk / Needs Review";
  } else if (priorityScore >= 18 && o.feasibility === "Easy") {
    priorityCategory = "Quick Win";
  } else if (priorityScore >= 18 && o.feasibility !== "Easy") {
    priorityCategory = "Strategic Project";
  } else if (priorityScore >= 10) {
    priorityCategory = "Discovery Needed";
  } else {
    priorityCategory = "Process Issue";
  }

  const nextStepMap: Record<string, string> = {
    "Quick Win": "Schedule prototype scoping conversation",
    "Discovery Needed": "Schedule workflow walkthrough",
    "Strategic Project": "Identify stakeholders and dependencies",
    "High Risk / Needs Review":
      "Review with Security/Legal/Data owner before solutioning",
    "Process Issue": "Explore process/template/documentation improvement",
    "Not a Fit": "Do not pursue at this time",
  };
  const recommendedNextStep =
    nextStepMap[priorityCategory] || "Review manually";

  return {
    estRunsPerMonth,
    estMonthlyHours,
    annualizedHours,
    impactScore,
    frequencyScore: freqScore,
    frictionScore,
    riskPenalty,
    priorityScore,
    priorityCategory,
    recommendedNextStep,
  };
}
