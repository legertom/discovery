"use client";

import { useStore } from "@/lib/store";
import { Card, CardHeader, Button, Pill } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import {
  TEAMS,
  FREQUENCIES,
  FRICTION_TYPES,
  SOLUTION_TYPES,
  STATUSES,
  RISK_LEVELS,
  FEASIBILITIES,
  PRIORITY_CATEGORIES,
  SCORING_WEIGHTS,
} from "@/lib/lists";

function ListCard({ title, values }: { title: string; values: readonly string[] }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={`${values.length} values`} />
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

export default function SettingsPage() {
  const { opportunities, sessions, steps, resetToSeed, loaded, mode } = useStore();

  return (
    <>
      <PageHeader
        title="Lists & Settings"
        description="Reference values used across the app and the scoring weights that drive prioritization."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Scoring Weights"
            subtitle="Changing these would change how priority is calculated."
          />
          <div className="divide-y divide-slate-100">
            {Object.entries({
              "Impact Weight": SCORING_WEIGHTS.impact,
              "Frequency Weight": SCORING_WEIGHTS.frequency,
              "Pain Weight": SCORING_WEIGHTS.pain,
              "Feasibility Weight": SCORING_WEIGHTS.feasibility,
              "Risk Penalty Weight": SCORING_WEIGHTS.riskPenalty,
            }).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-slate-600">{k}</span>
                <span className="font-mono text-sm font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>
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
                    Records are stored in the database and shared across everyone using
                    this app.
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

      <div className="grid gap-4 md:grid-cols-2">
        <ListCard title="Team / Function" values={TEAMS} />
        <ListCard title="Frequency" values={FREQUENCIES} />
        <ListCard title="Friction Type" values={FRICTION_TYPES} />
        <ListCard title="Likely Solution Type" values={SOLUTION_TYPES} />
        <ListCard title="Opportunity Status" values={STATUSES} />
        <ListCard title="Priority Category" values={PRIORITY_CATEGORIES} />
        <ListCard title="Risk Level" values={RISK_LEVELS} />
        <ListCard title="Feasibility" values={FEASIBILITIES} />
      </div>
    </>
  );
}
