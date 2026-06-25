"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { computeScore } from "@/lib/scoring";
import { Card, Input, Select, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { PriorityBadge, RiskBadge, StatusBadge, ScoreBadge } from "@/components/badges";
import { PRIORITY_CATEGORIES } from "@/lib/lists";
import { fmtHours } from "@/lib/utils";

type SortKey = "priorityScore" | "estMonthlyHours" | "workflowName";

export default function OpportunitiesPage() {
  const { opportunities, loaded } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<SortKey>("priorityScore");

  const rows = useMemo(() => {
    const f = q.trim().toLowerCase();
    let list = opportunities.map((o) => ({ o, s: computeScore(o) }));
    if (f)
      list = list.filter(
        (x) =>
          x.o.workflowName.toLowerCase().includes(f) ||
          x.o.id.toLowerCase().includes(f) ||
          x.o.team.toLowerCase().includes(f)
      );
    if (cat) list = list.filter((x) => x.s.priorityCategory === cat);
    list.sort((a, b) => {
      if (sort === "workflowName")
        return a.o.workflowName.localeCompare(b.o.workflowName);
      return b.s[sort] - a.s[sort];
    });
    return list;
  }, [opportunities, q, cat, sort]);

  if (!loaded) return <div className="text-sm text-slate-400">Loading…</div>;

  return (
    <>
      <PageHeader
        title="Triage & Scoring"
        description="Formula-derived impact, friction, risk, and priority. Set Status, Solution Type, Feasibility, and Risk on each opportunity's brief."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="w-56">
          <Select
            options={PRIORITY_CATEGORIES}
            placeholder="All categories"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={["Priority Score", "Monthly Hours", "Name"]}
            value={
              sort === "priorityScore"
                ? "Priority Score"
                : sort === "estMonthlyHours"
                ? "Monthly Hours"
                : "Name"
            }
            onChange={(e) => {
              const v = e.target.value;
              setSort(
                v === "Priority Score"
                  ? "priorityScore"
                  : v === "Monthly Hours"
                  ? "estMonthlyHours"
                  : "workflowName"
              );
            }}
          />
        </div>
        <div className="ml-auto text-xs text-slate-500">
          {rows.length} of {opportunities.length}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No opportunities match" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Impact</th>
                  <th className="px-4 py-3 text-right">Friction</th>
                  <th className="px-4 py-3 text-right">Hrs/mo</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ o, s }) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      {o.id}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/opportunities/${o.id}`}
                        className="font-medium text-slate-800 hover:text-navy"
                      >
                        {o.workflowName || "(untitled)"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {o.team || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {s.impactScore}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {s.frictionScore}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {fmtHours(s.estMonthlyHours)}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge value={o.riskLevel} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBadge value={s.priorityScore} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge value={s.priorityCategory} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
