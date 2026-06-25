"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { DiscoverySession, DiscoveryStep } from "@/lib/types";
import {
  Card,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  Field,
  Modal,
  EmptyState,
  Pill,
} from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { SESSION_TYPES, SOLUTION_TYPES, JUDGMENT_OPTS, AUTO_OPTS } from "@/lib/lists";
import { fmtDate } from "@/lib/utils";

function DiscoveryInner() {
  const params = useSearchParams();
  const oppFromUrl = params.get("opp") || "";
  const {
    opportunities,
    sessions,
    steps,
    addSession,
    addStep,
    removeSession,
    removeStep,
    newSessionId,
    newStepId,
    loaded,
  } = useStore();

  const [oppFilter, setOppFilter] = useState(oppFromUrl);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [stepOpen, setStepOpen] = useState(false);

  const oppIds = useMemo(() => opportunities.map((o) => o.id), [opportunities]);
  const oppLabel = (id: string) => {
    const o = opportunities.find((x) => x.id === id);
    return o ? `${o.id} — ${o.workflowName}` : id;
  };

  const visibleSessions = sessions.filter(
    (s) => !oppFilter || s.opportunityId === oppFilter
  );
  const visibleSteps = steps
    .filter((s) => !oppFilter || s.opportunityId === oppFilter)
    .sort((a, b) =>
      a.opportunityId === b.opportunityId
        ? a.stepNumber - b.stepNumber
        : a.opportunityId.localeCompare(b.opportunityId)
    );

  if (!loaded) return <div className="text-sm text-slate-400">Loading…</div>;

  return (
    <>
      <PageHeader
        title="Discovery"
        description="Log discovery conversations (summaries) and detailed step-by-step workflow walkthroughs."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStepOpen(true)} disabled={!oppIds.length}>
              Add Step
            </Button>
            <Button onClick={() => setSessionOpen(true)} disabled={!oppIds.length}>
              Log Session
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500">Filter by opportunity:</span>
        <div className="w-80">
          <Select
            options={oppIds.map(oppLabel)}
            placeholder="All opportunities"
            value={oppFilter ? oppLabel(oppFilter) : ""}
            onChange={(e) => {
              const label = e.target.value;
              const found = oppIds.find((id) => oppLabel(id) === label);
              setOppFilter(found || "");
            }}
          />
        </div>
      </div>

      {/* Sessions */}
      <Card className="mb-6">
        <CardHeader
          title="Discovery Sessions"
          subtitle="One row per conversation, walkthrough, interview, or scoping session."
        />
        {visibleSessions.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-slate-400">
            No sessions logged{oppFilter ? " for this opportunity" : ""}.
          </p>
        ) : (
          <div className="space-y-3 p-5">
            {visibleSessions.map((s) => (
              <div key={s.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{s.id}</span>
                    <Pill className="bg-purple-100 text-purple-700">{s.sessionType}</Pill>
                    <Link
                      href={`/opportunities/${s.opportunityId}`}
                      className="text-xs text-slate-500 hover:text-navy"
                    >
                      {s.opportunityId}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{fmtDate(s.sessionDate)}</span>
                    <button
                      onClick={() => removeSession(s.id)}
                      className="text-xs text-slate-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {s.sessionGoal && (
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Goal: </span>
                    {s.sessionGoal}
                  </p>
                )}
                {s.summaryLearned && (
                  <p className="mt-2 text-sm text-slate-700">{s.summaryLearned}</p>
                )}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {s.keyPainPoints && <Mini label="Key pain points" value={s.keyPainPoints} />}
                  {s.risksGuardrails && <Mini label="Risks / guardrails" value={s.risksGuardrails} />}
                  {s.dependencies && <Mini label="Dependencies" value={s.dependencies} />}
                  {s.recommendedNextStep && (
                    <Mini label="Next step" value={s.recommendedNextStep} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Step log */}
      <Card>
        <CardHeader
          title="Discovery Step Log"
          subtitle="Detailed current-state steps. Many rows per opportunity — filter above to focus."
        />
        {visibleSteps.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-slate-400">
            No steps logged{oppFilter ? " for this opportunity" : ""}.
          </p>
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Step</th>
                  <th className="px-3 py-2">Tool</th>
                  <th className="px-3 py-2">Manual action</th>
                  <th className="px-3 py-2">Pain</th>
                  <th className="px-3 py-2">Judgment</th>
                  <th className="px-3 py-2">Automate</th>
                  <th className="px-3 py-2">AI?</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleSteps.map((s) => (
                  <tr key={s.id} className="align-top hover:bg-slate-50">
                    <td className="px-3 py-2 tabular-nums text-slate-400">{s.stepNumber}</td>
                    <td className="px-3 py-2 text-slate-800">
                      {s.stepDescription}
                      {!oppFilter && (
                        <div className="text-[11px] text-slate-400">{s.opportunityId}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{s.toolSystem}</td>
                    <td className="px-3 py-2 text-slate-600">{s.manualAction}</td>
                    <td className="px-3 py-2 text-slate-600">{s.painObserved}</td>
                    <td className="px-3 py-2">
                      <Tag v={s.humanJudgment} />
                    </td>
                    <td className="px-3 py-2">
                      <Tag v={s.couldBeAutomated} />
                    </td>
                    <td className="px-3 py-2">
                      <Tag v={s.couldBeAiAssisted} />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeStep(s.id)}
                        className="text-xs text-slate-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {sessionOpen && (
        <SessionForm
          oppIds={oppIds}
          oppLabel={oppLabel}
          defaultOpp={oppFilter}
          onClose={() => setSessionOpen(false)}
          onSave={(s) => {
            addSession(s);
            setSessionOpen(false);
          }}
          newId={newSessionId()}
          ownerFor={(id) =>
            opportunities.find((o) => o.id === id)?.workflowOwner || ""
          }
        />
      )}
      {stepOpen && (
        <StepForm
          oppIds={oppIds}
          oppLabel={oppLabel}
          defaultOpp={oppFilter}
          sessions={sessions}
          onClose={() => setStepOpen(false)}
          onSave={(s) => {
            addStep(s);
            setStepOpen(false);
          }}
          newId={newStepId()}
          nextStepNumber={(oppId) =>
            steps.filter((x) => x.opportunityId === oppId).length + 1
          }
        />
      )}
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="text-xs text-slate-700">{value}</div>
    </div>
  );
}

function Tag({ v }: { v: string }) {
  const map: Record<string, string> = {
    Yes: "bg-green-100 text-green-700",
    No: "bg-slate-100 text-slate-500",
    Partially: "bg-amber-100 text-amber-700",
    Sometimes: "bg-amber-100 text-amber-700",
    Unknown: "bg-slate-100 text-slate-400",
  };
  return <Pill className={map[v] || "bg-slate-100 text-slate-500"}>{v}</Pill>;
}

function SessionForm({
  oppIds,
  oppLabel,
  defaultOpp,
  onClose,
  onSave,
  newId,
  ownerFor,
}: {
  oppIds: string[];
  oppLabel: (id: string) => string;
  defaultOpp: string;
  onClose: () => void;
  onSave: (s: DiscoverySession) => void;
  newId: string;
  ownerFor: (id: string) => string;
}) {
  const [s, setS] = useState<DiscoverySession>({
    id: newId,
    opportunityId: defaultOpp || oppIds[0] || "",
    sessionDate: new Date().toISOString().slice(0, 10),
    facilitator: "",
    workflowOwnerSme: ownerFor(defaultOpp || oppIds[0] || ""),
    sessionType: "Live Workflow Walkthrough",
    sessionGoal: "",
    summaryLearned: "",
    keyPainPoints: "",
    risksGuardrails: "",
    dependencies: "",
    likelySolutionDirection: "",
    recommendedNextStep: "",
    ownerOfNextStep: "",
    nextReviewDate: "",
    notes: "",
  });
  const set = <K extends keyof DiscoverySession>(k: K, v: DiscoverySession[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  return (
    <Modal
      open
      onClose={onClose}
      title={`Log Discovery Session — ${s.id}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(s)} disabled={!s.opportunityId}>
            Save Session
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Opportunity">
          <Select
            options={oppIds.map(oppLabel)}
            value={s.opportunityId ? oppLabel(s.opportunityId) : ""}
            placeholder="Select…"
            onChange={(e) => {
              const id = oppIds.find((x) => oppLabel(x) === e.target.value) || "";
              set("opportunityId", id);
              set("workflowOwnerSme", ownerFor(id));
            }}
          />
        </Field>
        <Field label="Session type">
          <Select
            options={SESSION_TYPES}
            value={s.sessionType}
            onChange={(e) => set("sessionType", e.target.value as DiscoverySession["sessionType"])}
          />
        </Field>
        <Field label="Session date">
          <Input
            type="date"
            value={s.sessionDate}
            onChange={(e) => set("sessionDate", e.target.value)}
          />
        </Field>
        <Field label="Facilitator">
          <Input value={s.facilitator} onChange={(e) => set("facilitator", e.target.value)} />
        </Field>
        <Field label="Session goal" className="sm:col-span-2">
          <Input value={s.sessionGoal} onChange={(e) => set("sessionGoal", e.target.value)} />
        </Field>
        <Field label="Summary of what we learned" className="sm:col-span-2">
          <Textarea
            value={s.summaryLearned}
            onChange={(e) => set("summaryLearned", e.target.value)}
          />
        </Field>
        <Field label="Key pain points">
          <Textarea value={s.keyPainPoints} onChange={(e) => set("keyPainPoints", e.target.value)} />
        </Field>
        <Field label="Risks / guardrails">
          <Textarea value={s.risksGuardrails} onChange={(e) => set("risksGuardrails", e.target.value)} />
        </Field>
        <Field label="Dependencies / access needed">
          <Textarea value={s.dependencies} onChange={(e) => set("dependencies", e.target.value)} />
        </Field>
        <Field label="Likely solution direction">
          <Select
            options={SOLUTION_TYPES}
            placeholder="Not yet clear"
            value={s.likelySolutionDirection}
            onChange={(e) =>
              set("likelySolutionDirection", e.target.value as DiscoverySession["likelySolutionDirection"])
            }
          />
        </Field>
        <Field label="Recommended next step">
          <Input
            value={s.recommendedNextStep}
            onChange={(e) => set("recommendedNextStep", e.target.value)}
          />
        </Field>
        <Field label="Owner of next step">
          <Input value={s.ownerOfNextStep} onChange={(e) => set("ownerOfNextStep", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function StepForm({
  oppIds,
  oppLabel,
  defaultOpp,
  sessions,
  onClose,
  onSave,
  newId,
  nextStepNumber,
}: {
  oppIds: string[];
  oppLabel: (id: string) => string;
  defaultOpp: string;
  sessions: DiscoverySession[];
  onClose: () => void;
  onSave: (s: DiscoveryStep) => void;
  newId: string;
  nextStepNumber: (oppId: string) => number;
}) {
  const firstOpp = defaultOpp || oppIds[0] || "";
  const [s, setS] = useState<DiscoveryStep>({
    id: newId,
    opportunityId: firstOpp,
    sessionId: "",
    stepNumber: nextStepNumber(firstOpp),
    stepDescription: "",
    toolSystem: "",
    input: "",
    output: "",
    manualAction: "",
    timeSpent: "",
    painObserved: "",
    errorRiskPoint: "",
    humanJudgment: "Unknown",
    couldBeAutomated: "Unknown",
    couldBeAiAssisted: "Unknown",
    dependency: "",
    notes: "",
  });
  const set = <K extends keyof DiscoveryStep>(k: K, v: DiscoveryStep[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const sessionOpts = sessions
    .filter((x) => x.opportunityId === s.opportunityId)
    .map((x) => `${x.id} — ${x.sessionType}`);

  return (
    <Modal
      open
      onClose={onClose}
      title={`Add Workflow Step — ${s.id}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(s)} disabled={!s.opportunityId || !s.stepDescription}>
            Save Step
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Opportunity">
          <Select
            options={oppIds.map(oppLabel)}
            value={s.opportunityId ? oppLabel(s.opportunityId) : ""}
            placeholder="Select…"
            onChange={(e) => {
              const id = oppIds.find((x) => oppLabel(x) === e.target.value) || "";
              set("opportunityId", id);
              set("stepNumber", nextStepNumber(id));
            }}
          />
        </Field>
        <Field label="Discovery session (optional)">
          <Select
            options={sessionOpts}
            placeholder="None"
            value={
              s.sessionId
                ? sessionOpts.find((o) => o.startsWith(s.sessionId)) || ""
                : ""
            }
            onChange={(e) => set("sessionId", e.target.value.split(" — ")[0] || "")}
          />
        </Field>
        <Field label="Step #">
          <Input
            type="number"
            min={1}
            value={s.stepNumber}
            onChange={(e) => set("stepNumber", Number(e.target.value))}
          />
        </Field>
        <Field label="Time spent on step">
          <Input value={s.timeSpent} onChange={(e) => set("timeSpent", e.target.value)} placeholder="e.g., 10 min" />
        </Field>
        <Field label="Step description" className="sm:col-span-2">
          <Textarea
            value={s.stepDescription}
            onChange={(e) => set("stepDescription", e.target.value)}
            placeholder="What happens in this step — the action, not a solution."
          />
        </Field>
        <Field label="Tool / system used">
          <Input value={s.toolSystem} onChange={(e) => set("toolSystem", e.target.value)} />
        </Field>
        <Field label="Manual action taken">
          <Input value={s.manualAction} onChange={(e) => set("manualAction", e.target.value)} />
        </Field>
        <Field label="Input">
          <Input value={s.input} onChange={(e) => set("input", e.target.value)} />
        </Field>
        <Field label="Output">
          <Input value={s.output} onChange={(e) => set("output", e.target.value)} />
        </Field>
        <Field label="Pain point observed">
          <Input value={s.painObserved} onChange={(e) => set("painObserved", e.target.value)} />
        </Field>
        <Field label="Error / risk point">
          <Input value={s.errorRiskPoint} onChange={(e) => set("errorRiskPoint", e.target.value)} />
        </Field>
        <Field label="Human judgment required?">
          <Select
            options={JUDGMENT_OPTS}
            value={s.humanJudgment}
            onChange={(e) => set("humanJudgment", e.target.value as DiscoveryStep["humanJudgment"])}
          />
        </Field>
        <Field label="Could be automated?">
          <Select
            options={AUTO_OPTS}
            value={s.couldBeAutomated}
            onChange={(e) => set("couldBeAutomated", e.target.value as DiscoveryStep["couldBeAutomated"])}
          />
        </Field>
        <Field label="Could be AI-assisted?">
          <Select
            options={AUTO_OPTS}
            value={s.couldBeAiAssisted}
            onChange={(e) => set("couldBeAiAssisted", e.target.value as DiscoveryStep["couldBeAiAssisted"])}
          />
        </Field>
        <Field label="Dependency / access needed">
          <Input value={s.dependency} onChange={(e) => set("dependency", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <DiscoveryInner />
    </Suspense>
  );
}
