"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { DiscoveryStep } from "@/lib/types";
import type { ExtractedStep } from "@/lib/stepExtraction";
import {
  Card,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  Field,
  EmptyState,
} from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { JUDGMENT_OPTS, AUTO_OPTS } from "@/lib/lists";
import { nextId } from "@/lib/utils";
import { Sparkles, ArrowLeft, AlertTriangle, Trash2, Plus } from "lucide-react";

function blankStep(): ExtractedStep {
  return {
    stepNumber: 0,
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
  };
}

function ImportStepsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { opportunities, sessions, steps, addStep, loaded } = useStore();

  const oppIds = useMemo(() => opportunities.map((o) => o.id), [opportunities]);
  const oppLabel = (id: string) => {
    const o = opportunities.find((x) => x.id === id);
    return o ? `${o.id} — ${o.workflowName}` : id;
  };

  const [phase, setPhase] = useState<"input" | "review">("input");
  const [oppId, setOppId] = useState(params.get("opp") || oppIds[0] || "");
  const [sessionId, setSessionId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ExtractedStep[]>([]);
  const [summary, setSummary] = useState("");

  const sessionOpts = sessions
    .filter((x) => x.opportunityId === oppId)
    .map((x) => `${x.id} — ${x.sessionType}`);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/extract-steps", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: notes }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Extraction failed.");
        return;
      }
      setDraft(json.steps as ExtractedStep[]);
      setSummary(json.summary || "");
      setPhase("review");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  function setStep(i: number, patch: Partial<ExtractedStep>) {
    setDraft((d) => d.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeStep(i: number) {
    setDraft((d) => d.filter((_, idx) => idx !== i));
  }

  function save() {
    const base = steps.filter((x) => x.opportunityId === oppId).length;
    let ids = steps.map((s) => s.id);
    draft.forEach((st, i) => {
      const id = nextId("ST", ids);
      ids = [...ids, id];
      const full: DiscoveryStep = {
        ...st,
        id,
        opportunityId: oppId,
        sessionId,
        stepNumber: base + i + 1,
      };
      addStep(full);
    });
    router.push(`/discovery?opp=${oppId}`);
  }

  if (!loaded) return <div className="text-sm text-slate-400">Loading…</div>;
  if (!oppIds.length)
    return (
      <EmptyState
        title="No opportunities yet"
        description="Create an intake first, then you can map its discovery steps."
      />
    );

  // ---- Input phase ----
  if (phase === "input") {
    return (
      <>
        <div className="mb-4">
          <button
            onClick={() => router.push("/discovery")}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Discovery
          </button>
        </div>
        <PageHeader
          title="Build Steps from Notes"
          description="Paste rough discovery notes or a walkthrough transcript. AI maps them into structured current-state steps — you review and edit before saving."
        />
        <Card>
          <CardHeader
            title="Discovery notes or transcript"
            subtitle="Powered by Claude (Opus 4.8) via the Vercel AI Gateway"
          />
          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Opportunity" hint="Steps will be attached here.">
                <Select
                  options={oppIds.map(oppLabel)}
                  value={oppId ? oppLabel(oppId) : ""}
                  placeholder="Select…"
                  onChange={(e) => {
                    const id = oppIds.find((x) => oppLabel(x) === e.target.value) || "";
                    setOppId(id);
                    setSessionId("");
                  }}
                />
              </Field>
              <Field label="Discovery session (optional)">
                <Select
                  options={sessionOpts}
                  placeholder="None"
                  value={
                    sessionId
                      ? sessionOpts.find((o) => o.startsWith(sessionId)) || ""
                      : ""
                  }
                  onChange={(e) => setSessionId(e.target.value.split(" — ")[0] || "")}
                />
              </Field>
            </div>
            <Textarea
              rows={14}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste the walkthrough notes / transcript here…"
              className="font-mono text-xs"
            />
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={generate}
                disabled={loading || !oppId || notes.trim().length < 20}
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "Building steps…" : "Build steps"}
              </Button>
            </div>
          </div>
        </Card>
      </>
    );
  }

  // ---- Review phase ----
  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => setPhase("input")}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to notes
        </button>
      </div>
      <PageHeader
        title="Review steps"
        description={`${draft.length} step(s) for ${oppLabel(oppId)} — edit or remove any, then save.`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPhase("input")}>
              Discard
            </Button>
            <Button onClick={save} disabled={draft.length === 0}>
              Save {draft.length} step{draft.length === 1 ? "" : "s"}
            </Button>
          </div>
        }
      />

      {summary && (
        <Card className="mb-5">
          <CardHeader title="AI summary" />
          <p className="px-5 py-4 text-sm text-slate-700">{summary}</p>
        </Card>
      )}

      <div className="space-y-4">
        {draft.map((s, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <span className="text-sm font-semibold text-slate-700">Step {i + 1}</span>
              <button
                onClick={() => removeStep(i)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="Step description" className="md:col-span-2">
                <Textarea
                  rows={2}
                  value={s.stepDescription}
                  onChange={(e) => setStep(i, { stepDescription: e.target.value })}
                />
              </Field>
              <Field label="Tool / system">
                <Input value={s.toolSystem} onChange={(e) => setStep(i, { toolSystem: e.target.value })} />
              </Field>
              <Field label="Manual action">
                <Input value={s.manualAction} onChange={(e) => setStep(i, { manualAction: e.target.value })} />
              </Field>
              <Field label="Input">
                <Input value={s.input} onChange={(e) => setStep(i, { input: e.target.value })} />
              </Field>
              <Field label="Output">
                <Input value={s.output} onChange={(e) => setStep(i, { output: e.target.value })} />
              </Field>
              <Field label="Pain point observed">
                <Input value={s.painObserved} onChange={(e) => setStep(i, { painObserved: e.target.value })} />
              </Field>
              <Field label="Error / risk point">
                <Input value={s.errorRiskPoint} onChange={(e) => setStep(i, { errorRiskPoint: e.target.value })} />
              </Field>
              <Field label="Time spent">
                <Input value={s.timeSpent} onChange={(e) => setStep(i, { timeSpent: e.target.value })} placeholder="e.g., 10 min" />
              </Field>
              <Field label="Dependency / access needed">
                <Input value={s.dependency} onChange={(e) => setStep(i, { dependency: e.target.value })} />
              </Field>
              <Field label="Human judgment?">
                <Select
                  options={JUDGMENT_OPTS}
                  value={s.humanJudgment}
                  onChange={(e) => setStep(i, { humanJudgment: e.target.value as ExtractedStep["humanJudgment"] })}
                />
              </Field>
              <Field label="Could be automated?">
                <Select
                  options={AUTO_OPTS}
                  value={s.couldBeAutomated}
                  onChange={(e) => setStep(i, { couldBeAutomated: e.target.value as ExtractedStep["couldBeAutomated"] })}
                />
              </Field>
              <Field label="Could be AI-assisted?">
                <Select
                  options={AUTO_OPTS}
                  value={s.couldBeAiAssisted}
                  onChange={(e) => setStep(i, { couldBeAiAssisted: e.target.value as ExtractedStep["couldBeAiAssisted"] })}
                />
              </Field>
              <Field label="Notes" className="md:col-span-2">
                <Input value={s.notes} onChange={(e) => setStep(i, { notes: e.target.value })} />
              </Field>
            </div>
          </Card>
        ))}

        <div className="flex items-center justify-between pb-4">
          <Button
            variant="secondary"
            onClick={() => setDraft((d) => [...d, blankStep()])}
          >
            <Plus className="h-4 w-4" /> Add a step
          </Button>
          <Button onClick={save} disabled={draft.length === 0}>
            Save {draft.length} step{draft.length === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </>
  );
}

export default function ImportStepsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <ImportStepsInner />
    </Suspense>
  );
}
