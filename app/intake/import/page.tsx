"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, blankOpportunity } from "@/lib/store";
import type { Opportunity } from "@/lib/types";
import {
  Card,
  CardHeader,
  Button,
  Input,
  NumberInput,
  Textarea,
  Select,
  Field,
  Pill,
  EmptyState,
} from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { TEAMS, FREQUENCIES, YES_NO_UNSURE } from "@/lib/lists";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowLeft, AlertTriangle } from "lucide-react";

type ExtractResponse = {
  patch: Partial<Opportunity>;
  confidence: Record<string, string>;
  evidence: Record<string, string>;
  unansweredQuestions: string[];
  summary: string;
};

function ConfidenceChip({ level }: { level?: string }) {
  if (!level) return null;
  const map: Record<string, string> = {
    stated: "bg-green-100 text-green-700",
    inferred: "bg-amber-100 text-amber-700",
    missing: "bg-slate-200 text-slate-500",
  };
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", map[level])}>
      {level}
    </span>
  );
}

export default function ImportPage() {
  const router = useRouter();
  const { addOpportunity, newOpportunityId } = useStore();

  const [phase, setPhase] = useState<"input" | "review">("input");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState<Opportunity | null>(null);
  const [meta, setMeta] = useState<ExtractResponse | null>(null);

  async function runExtraction() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Extraction failed.");
        return;
      }
      const base = blankOpportunity(newOpportunityId());
      setDraft({ ...base, ...(json.patch as Partial<Opportunity>) });
      setMeta(json as ExtractResponse);
      setPhase("review");
    } catch {
      setError("Network error. Is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  function set<K extends keyof Opportunity>(key: K, val: Opportunity[K]) {
    setDraft((d) => (d ? { ...d, [key]: val } : d));
  }

  function save() {
    if (!draft) return;
    addOpportunity(draft);
    router.push(`/opportunities/${draft.id}`);
  }

  const conf = (k: string) => meta?.confidence[k];
  const evid = (k: string) => meta?.evidence[k] || undefined;

  // -------- Input phase --------
  if (phase === "input") {
    return (
      <>
        <div className="mb-4">
          <button
            onClick={() => router.push("/intake")}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Intake
          </button>
        </div>
        <PageHeader
          title="New Intake from Interview Notes"
          description="Paste a Granola summary or transcript from an intake interview. AI will draft a new intake and flag what wasn't covered — you review and edit before saving."
        />
        <Card>
          <CardHeader
            title="Meeting summary or transcript"
            subtitle="Powered by Claude (Opus 4.8) via the Vercel AI Gateway"
          />
          <div className="space-y-4 p-5">
            <Textarea
              rows={14}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the Granola summary or transcript here…"
              className="font-mono text-xs"
            />
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={runExtraction} disabled={loading || transcript.trim().length < 20}>
                <Sparkles className="h-4 w-4" />
                {loading ? "Drafting intake…" : "Draft intake"}
              </Button>
            </div>
          </div>
        </Card>
      </>
    );
  }

  // -------- Review phase --------
  if (!draft || !meta) return <EmptyState title="Nothing to review" />;

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => setPhase("input")}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to transcript
        </button>
      </div>
      <PageHeader
        title="Review drafted intake"
        description={`${draft.id} — check each field, fix anything off, then save. Green = stated, amber = inferred, gray = guessed.`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPhase("input")}>
              Discard
            </Button>
            <Button onClick={save}>Save Intake</Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {meta.summary && (
            <Card>
              <CardHeader title="AI summary" />
              <p className="px-5 py-4 text-sm text-slate-700">{meta.summary}</p>
            </Card>
          )}

          <Card>
            <CardHeader title="Drafted fields" subtitle="All editable. Hover a field for the supporting quote." />
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="Workflow / Task Name" className="md:col-span-2">
                <div className="mb-1"><ConfidenceChip level={conf("workflowName")} /></div>
                <Input title={evid("workflowName")} value={draft.workflowName} onChange={(e) => set("workflowName", e.target.value)} />
              </Field>
              <Field label="Team / Function">
                <div className="mb-1"><ConfidenceChip level={conf("team")} /></div>
                <Select options={TEAMS} placeholder="Select…" value={draft.team} onChange={(e) => set("team", e.target.value)} />
              </Field>
              <Field label="Workflow Owner">
                <div className="mb-1"><ConfidenceChip level={conf("workflowOwner")} /></div>
                <Input title={evid("workflowOwner")} value={draft.workflowOwner} onChange={(e) => set("workflowOwner", e.target.value)} />
              </Field>
              <Field label="Purpose" className="md:col-span-2">
                <div className="mb-1"><ConfidenceChip level={conf("purpose")} /></div>
                <Textarea title={evid("purpose")} value={draft.purpose} onChange={(e) => set("purpose", e.target.value)} />
              </Field>
              <Field label="Current Process" className="md:col-span-2">
                <div className="mb-1"><ConfidenceChip level={conf("currentProcess")} /></div>
                <Textarea title={evid("currentProcess")} value={draft.currentProcess} onChange={(e) => set("currentProcess", e.target.value)} />
              </Field>
              <Field label="Frequency">
                <div className="mb-1"><ConfidenceChip level={conf("frequency")} /></div>
                <Select options={FREQUENCIES} value={draft.frequency} onChange={(e) => set("frequency", e.target.value as Opportunity["frequency"])} />
              </Field>
              <Field label="Minutes per run">
                <div className="mb-1"><ConfidenceChip level={conf("minutesPerRun")} /></div>
                <NumberInput min={0} value={draft.minutesPerRun} onValueChange={(n) => set("minutesPerRun", n)} />
              </Field>
              <Field label="People doing this work">
                <div className="mb-1"><ConfidenceChip level={conf("peopleDoingWork")} /></div>
                <NumberInput min={0} value={draft.peopleDoingWork} onValueChange={(n) => set("peopleDoingWork", n)} />
              </Field>
              <Field label="Systems / tools involved">
                <div className="mb-1"><ConfidenceChip level={conf("systemsInvolved")} /></div>
                <Input title={evid("systemsInvolved")} value={draft.systemsInvolved} onChange={(e) => set("systemsInvolved", e.target.value)} />
              </Field>
              {(["painRating", "businessCriticality", "errorProneness", "urgency"] as const).map((k) => (
                <Field key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()) + " (1-5)"}>
                  <div className="mb-1"><ConfidenceChip level={conf(k)} /></div>
                  <NumberInput min={1} max={5} value={draft[k] as number} onValueChange={(n) => set(k, n as Opportunity[typeof k])} />
                </Field>
              ))}
              <Field label="Sensitive data?">
                <div className="mb-1"><ConfidenceChip level={conf("sensitiveData")} /></div>
                <Select options={YES_NO_UNSURE} value={draft.sensitiveData} onChange={(e) => set("sensitiveData", e.target.value as Opportunity["sensitiveData"])} />
              </Field>
              <Field label="Data types involved">
                <div className="mb-1"><ConfidenceChip level={conf("dataTypes")} /></div>
                <Input title={evid("dataTypes")} value={draft.dataTypes} onChange={(e) => set("dataTypes", e.target.value)} />
              </Field>
              <Field label="Desired future state" className="md:col-span-2">
                <div className="mb-1"><ConfidenceChip level={conf("desiredFutureState")} /></div>
                <Textarea title={evid("desiredFutureState")} value={draft.desiredFutureState} onChange={(e) => set("desiredFutureState", e.target.value)} />
              </Field>
              <Field label="Should still require human review">
                <div className="mb-1"><ConfidenceChip level={conf("humanReview")} /></div>
                <Textarea title={evid("humanReview")} value={draft.humanReview} onChange={(e) => set("humanReview", e.target.value)} />
              </Field>
              <Field label="How would we know this worked?">
                <div className="mb-1"><ConfidenceChip level={conf("howWouldWeKnow")} /></div>
                <Textarea title={evid("howWouldWeKnow")} value={draft.howWouldWeKnow} onChange={(e) => set("howWouldWeKnow", e.target.value)} />
              </Field>
              <Field label="Friction types (from interview)" className="md:col-span-2">
                <div className="mb-1"><ConfidenceChip level={conf("frictionTypes")} /></div>
                <div className="flex flex-wrap gap-1.5">
                  {draft.frictionTypes.length ? (
                    draft.frictionTypes.map((ft) => (
                      <Pill key={ft} className="bg-slate-100 text-slate-600">{ft}</Pill>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None detected — add on the detail page.</span>
                  )}
                </div>
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Not covered in the interview"
              subtitle={`${meta.unansweredQuestions.length} follow-up question(s)`}
            />
            {meta.unansweredQuestions.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-slate-400">
                The interview covered everything. 🎉
              </p>
            ) : (
              <ul className="space-y-2 px-5 py-4">
                {meta.unansweredQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    {q}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <CardHeader title="Next" />
            <div className="space-y-3 px-5 py-4 text-xs text-slate-600">
              <p>Saving creates a new intake. Triage fields (status, feasibility, risk) stay for you to set on the brief.</p>
              <Button onClick={save} className="w-full">Save Intake</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
