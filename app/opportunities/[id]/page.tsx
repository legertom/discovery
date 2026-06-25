"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { computeScore } from "@/lib/scoring";
import type { Opportunity } from "@/lib/types";
import {
  Card,
  CardHeader,
  Button,
  Select,
  Input,
  Textarea,
  Field,
  Pill,
  Tooltip,
  EmptyState,
} from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { PriorityBadge, RiskBadge, StatusBadge } from "@/components/badges";
import {
  STATUSES,
  SOLUTION_TYPES,
  FEASIBILITIES,
  RISK_LEVELS,
} from "@/lib/lists";
import { fmtDate, fmtHours } from "@/lib/utils";
import { ArrowLeft, Trash2, Info, Pencil } from "lucide-react";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-slate-100 px-5 py-2.5 last:border-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 whitespace-pre-wrap text-sm text-slate-700">
        {value || <span className="text-slate-300">—</span>}
      </dd>
    </div>
  );
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    opportunities,
    sessions,
    steps,
    updateOpportunity,
    removeOpportunity,
    loaded,
  } = useStore();

  const o = opportunities.find((x) => x.id === id);
  const score = useMemo(() => (o ? computeScore(o) : null), [o]);
  const relatedSessions = sessions.filter((s) => s.opportunityId === id);
  const relatedSteps = steps
    .filter((s) => s.opportunityId === id)
    .sort((a, b) => a.stepNumber - b.stepNumber);

  if (!loaded) return <div className="text-sm text-slate-400">Loading…</div>;
  if (!o || !score)
    return (
      <EmptyState
        title="Opportunity not found"
        description={`No record for ${id}.`}
        action={
          <Link href="/opportunities">
            <Button>Back to Triage</Button>
          </Link>
        }
      />
    );

  function up<K extends keyof Opportunity>(key: K, val: Opportunity[K]) {
    updateOpportunity(id, { [key]: val } as Partial<Opportunity>);
  }

  function del() {
    if (confirm(`Delete ${o!.id} — "${o!.workflowName}"? This cannot be undone.`)) {
      removeOpportunity(id);
      router.push("/opportunities");
    }
  }

  return (
    <>
      <div className="mb-4">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Triage
        </Link>
      </div>

      <PageHeader
        title={o.workflowName || "(untitled workflow)"}
        description={`${o.id} · ${o.team || "—"} · Owner: ${o.workflowOwner || "—"} · Submitted ${fmtDate(o.submittedDate)}`}
        action={
          <div className="flex gap-2">
            <Link href={`/opportunities/${o.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" /> Edit intake
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={del}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: brief */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Overview" />
            <dl>
              <Row label="Purpose" value={o.purpose} />
              <Row label="Decision / outcome supported" value={o.decisionSupported} />
              <Row label="Who uses the output" value={o.whoUsesOutput} />
              <Row label="If late, wrong, or skipped" value={o.whatHappensIfLate} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Current Process & Friction" />
            <dl>
              <Row label="Current process" value={o.currentProcess} />
              <Row
                label="Friction types"
                value={
                  o.frictionTypes.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {o.frictionTypes.map((f) => (
                        <Pill key={f} className="bg-slate-100 text-slate-600">
                          {f}
                        </Pill>
                      ))}
                    </div>
                  ) : null
                }
              />
              <Row label="Systems involved" value={o.systemsInvolved} />
              <Row
                label="Ratings"
                value={`Pain ${o.painRating} · Criticality ${o.businessCriticality} · Error-prone ${o.errorProneness} · Urgency ${o.urgency}`}
              />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Time Cost" />
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-xl bg-slate-100 sm:grid-cols-4">
              {[
                { l: "Runs / month", v: score.estRunsPerMonth },
                { l: "Hours / month", v: fmtHours(score.estMonthlyHours) },
                { l: "Annual hours", v: fmtHours(score.annualizedHours) },
                { l: "People", v: o.peopleDoingWork },
              ].map((m) => (
                <div key={m.l} className="bg-white px-4 py-3">
                  <div className="text-lg font-semibold tabular-nums text-slate-800">
                    {m.v}
                  </div>
                  <div className="text-xs text-slate-500">{m.l}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Future State & Guardrails" />
            <dl>
              <Row label="Desired future state" value={o.desiredFutureState} />
              <Row label="Still require human review" value={o.humanReview} />
              <Row label="Never automate" value={o.neverAutomate} />
              <Row label="Would build trust" value={o.trust} />
              <Row label="Would make unusable" value={o.unusable} />
              <Row label="How we'd know it worked" value={o.howWouldWeKnow} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Data & Risk" />
            <dl>
              <Row label="Sensitive data?" value={o.sensitiveData} />
              <Row label="Data types" value={o.dataTypes} />
              <Row label="Input location" value={o.inputDataLocation} />
              <Row label="Output destination" value={o.outputDestination} />
              <Row label="Customers / districts / students affected" value={o.customersAffected} />
            </dl>
          </Card>
        </div>

        {/* Right: scoring + triage */}
        <div className="space-y-5">
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-1">
                  Priority
                  <Tooltip label="A directional, formula-derived score to help you sort and triage. It is a starting point, not a verdict — apply judgment.">
                    <Info className="h-3.5 w-3.5 cursor-help text-slate-400" />
                  </Tooltip>
                </span>
              }
            />
            <div className="px-5 py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular-nums text-slate-900">
                  {score.priorityScore}
                </span>
                <span className="text-xs text-slate-400">priority score</span>
              </div>
              <div className="mt-3">
                <PriorityBadge value={score.priorityCategory} />
              </div>
              <div className="mt-4 rounded-lg bg-navy-50 px-3 py-2.5 text-xs text-navy-900">
                <span className="font-semibold">Recommended next step: </span>
                {score.recommendedNextStep}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                {[
                  { l: "Impact", v: score.impactScore, tip: "Average of business criticality and urgency, plus a bonus for hours/month spent. Higher = bigger payoff if improved." },
                  { l: "Frequency", v: score.frequencyScore, tip: "How often the workflow runs — daily scores higher than monthly. Frequent friction compounds over time." },
                  { l: "Friction", v: score.frictionScore, tip: "Average of pain rating and error-proneness. Higher = more painful and mistake-prone." },
                  { l: "Risk penalty", v: score.riskPenalty, tip: "Added for high risk level and sensitive data, then subtracted from the score. High risk means review before solutioning — not necessarily 'no'." },
                ].map((m) => (
                  <Tooltip key={m.l} label={m.tip} className="w-full">
                    <div className="w-full rounded-lg border border-slate-200 py-2">
                      <div className="text-base font-semibold tabular-nums text-slate-800">
                        {m.v}
                      </div>
                      <div className="text-slate-500">{m.l}</div>
                    </div>
                  </Tooltip>
                ))}
              </div>

              <details className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
                <summary className="cursor-pointer font-medium text-slate-700">
                  How is this calculated?
                </summary>
                <div className="mt-2 space-y-2 leading-relaxed">
                  <p>
                    The priority score is a weighted, directional signal — sort by it,
                    then apply judgment.
                  </p>
                  <p className="rounded bg-slate-50 p-2 font-mono text-[11px]">
                    Priority = Impact×2 + Frequency + Friction×2 + Feasibility − Risk
                    penalty×2
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>
                      <strong>Impact</strong> — avg of criticality &amp; urgency, plus a
                      bonus for time spent.
                    </li>
                    <li><strong>Frequency</strong> — how often it runs.</li>
                    <li><strong>Friction</strong> — avg of pain &amp; error-proneness.</li>
                    <li>
                      <strong>Feasibility</strong> — Easy +2, Medium +1, Hard −1 (set it in
                      the Triage panel).
                    </li>
                    <li>
                      <strong>Risk penalty</strong> — from risk level + sensitive data;
                      pushes risky items toward review.
                    </li>
                  </ul>
                  <p>
                    The <strong>category</strong> comes from the score combined with
                    feasibility and risk (e.g. high score + Easy = Quick Win; high risk =
                    Needs Review).
                  </p>
                  <p>
                    The weights live in{" "}
                    <Link href="/settings" className="text-navy-600 underline">
                      Lists &amp; Settings
                    </Link>
                    .
                  </p>
                </div>
              </details>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Triage"
              subtitle="These drive the score. Changes save instantly."
            />
            <div className="space-y-3 px-5 py-4">
              <Field label="Status">
                <Select
                  options={STATUSES}
                  value={o.status}
                  onChange={(e) => up("status", e.target.value as Opportunity["status"])}
                />
              </Field>
              <Field label="Likely solution type">
                <Select
                  options={SOLUTION_TYPES}
                  placeholder="Not yet assessed"
                  value={o.likelySolutionType}
                  onChange={(e) =>
                    up("likelySolutionType", e.target.value as Opportunity["likelySolutionType"])
                  }
                />
              </Field>
              <Field label="Feasibility">
                <Select
                  options={FEASIBILITIES}
                  value={o.feasibility}
                  onChange={(e) => up("feasibility", e.target.value as Opportunity["feasibility"])}
                />
              </Field>
              <Field label="Risk level">
                <Select
                  options={RISK_LEVELS}
                  value={o.riskLevel}
                  onChange={(e) => up("riskLevel", e.target.value as Opportunity["riskLevel"])}
                />
              </Field>
              <Field label="Assignee">
                <Input
                  value={o.assignee}
                  onChange={(e) => up("assignee", e.target.value)}
                />
              </Field>
              <Field label="Next review date">
                <Input
                  type="date"
                  value={o.nextReviewDate}
                  onChange={(e) => up("nextReviewDate", e.target.value)}
                />
              </Field>
              <Field label="Triage notes">
                <Textarea
                  value={o.triageNotes}
                  onChange={(e) => up("triageNotes", e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <StatusBadge value={o.status} />
                <RiskBadge value={o.riskLevel} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Discovery"
              subtitle={`${relatedSessions.length} session(s), ${relatedSteps.length} step(s)`}
              action={
                <Link href={`/discovery?opp=${o.id}`}>
                  <Button variant="secondary" size="sm">
                    Open
                  </Button>
                </Link>
              }
            />
            <div className="divide-y divide-slate-100">
              {relatedSessions.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-slate-400">
                  No discovery sessions logged yet.
                </p>
              ) : (
                relatedSessions.map((s) => (
                  <div key={s.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">
                        {s.sessionType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {fmtDate(s.sessionDate)}
                      </span>
                    </div>
                    {s.summaryLearned && (
                      <p className="mt-1 line-clamp-3 text-xs text-slate-500">
                        {s.summaryLearned}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
