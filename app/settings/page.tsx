"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  CardHeader,
  Button,
  Input,
  NumberInput,
  Pill,
} from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import {
  FREQUENCIES,
  RISK_LEVELS,
  FEASIBILITIES,
  PRIORITY_CATEGORIES,
} from "@/lib/lists";
import type { AppSettings } from "@/lib/types";

// Read-only reference list (values wired into the scoring math — fixed).
function FixedListCard({ title, values }: { title: string; values: readonly string[] }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={`${values.length} values · fixed (tied to scoring)`} />
      <div className="flex flex-wrap gap-2 p-5">
        {values.map((v) => (
          <Pill key={v} className="bg-slate-100 text-slate-600">
            {v}
          </Pill>
        ))}
      </div>
    </Card>
  );
}

// Editable label list.
function ListEditor({
  title,
  values,
  onChange,
}: {
  title: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <Card>
      <CardHeader title={title} subtitle={`${values.length} values · editable`} />
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
            >
              {v}
              <button
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="text-slate-400 hover:text-red-600"
                aria-label={`Remove ${v}`}
              >
                ✕
              </button>
            </span>
          ))}
          {values.length === 0 && (
            <span className="text-xs text-slate-400">No values yet.</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Add a value…"
            className="text-sm"
          />
          <Button variant="secondary" size="sm" onClick={add} disabled={!draft.trim()}>
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

const WEIGHT_DEFS: { key: keyof AppSettings["weights"]; label: string }[] = [
  { key: "impact", label: "Impact Weight" },
  { key: "frequency", label: "Frequency Weight" },
  { key: "pain", label: "Pain Weight" },
  { key: "feasibility", label: "Feasibility Weight" },
  { key: "riskPenalty", label: "Risk Penalty Weight" },
];

export default function SettingsPage() {
  const {
    opportunities,
    sessions,
    steps,
    resetToSeed,
    loaded,
    mode,
    settings,
    updateSettings,
  } = useStore();

  return (
    <>
      <PageHeader
        title="Lists & Settings"
        description="Editable dropdown values and the scoring weights that drive prioritization. Changes save automatically."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Scoring Weights"
            subtitle="Multipliers in the priority formula. Changes recompute every score."
          />
          <div className="divide-y divide-slate-100">
            {WEIGHT_DEFS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-2.5">
                <span className="text-sm text-slate-600">{label}</span>
                <div className="w-20">
                  <NumberInput
                    value={settings.weights[key]}
                    onValueChange={(n) =>
                      updateSettings({ weights: { ...settings.weights, [key]: n } })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="px-5 py-3 text-[11px] text-slate-400">
            Formula: Impact×Impact + Frequency×Frequency + Friction×Pain +
            Feasibility×Feasibility − RiskPenalty×Risk Penalty.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Data"
            subtitle={
              mode === "db"
                ? "Connected to the database (Neon Postgres)"
                : mode === "local"
                ? "Local storage (no database connected)"
                : "Loading…"
            }
          />
          <div className="space-y-4 p-5">
            {loaded && (
              <>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { l: "Opportunities", v: opportunities.length },
                    { l: "Sessions", v: sessions.length },
                    { l: "Steps", v: steps.length },
                  ].map((m) => (
                    <div key={m.l} className="rounded-lg border border-slate-200 py-3">
                      <div className="text-xl font-semibold text-slate-800">{m.v}</div>
                      <div className="text-xs text-slate-500">{m.l}</div>
                    </div>
                  ))}
                </div>
                {mode === "db" ? (
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    Records and settings are stored in the database and shared across
                    everyone using this app.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-slate-500">
                      No database is connected, so data lives only in this browser.
                      Resetting restores the seeded sample opportunities.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (confirm("Reset all local data to the seeded samples?"))
                          resetToSeed();
                      }}
                    >
                      Reset to sample data
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Editable lists</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <ListEditor
          title="Team / Function"
          values={settings.teams}
          onChange={(teams) => updateSettings({ teams })}
        />
        <ListEditor
          title="Friction Type"
          values={settings.frictionTypes}
          onChange={(frictionTypes) => updateSettings({ frictionTypes })}
        />
        <ListEditor
          title="Opportunity Status"
          values={settings.statuses}
          onChange={(statuses) => updateSettings({ statuses })}
        />
        <ListEditor
          title="Likely Solution Type"
          values={settings.solutionTypes}
          onChange={(solutionTypes) => updateSettings({ solutionTypes })}
        />
      </div>

      <h2 className="mb-1 text-sm font-semibold text-slate-700">
        Fixed lists
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        These values are wired into the scoring formulas, so they can&apos;t be edited
        here without changing how scores are calculated.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <FixedListCard title="Frequency" values={FREQUENCIES} />
        <FixedListCard title="Priority Category" values={PRIORITY_CATEGORIES} />
        <FixedListCard title="Risk Level" values={RISK_LEVELS} />
        <FixedListCard title="Feasibility" values={FEASIBILITIES} />
      </div>
    </>
  );
}
