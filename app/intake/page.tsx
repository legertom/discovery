"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { computeScore } from "@/lib/scoring";
import { Card, Button, Input, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/badges";
import { fmtDate } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export default function IntakePage() {
  const { opportunities, loaded } = useStore();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const f = q.trim().toLowerCase();
    return opportunities
      .filter(
        (o) =>
          !f ||
          o.workflowName.toLowerCase().includes(f) ||
          o.id.toLowerCase().includes(f) ||
          o.team.toLowerCase().includes(f) ||
          o.submittedBy.toLowerCase().includes(f)
      )
      .map((o) => ({ o, s: computeScore(o) }))
      .sort((a, b) => (a.o.submittedDate < b.o.submittedDate ? 1 : -1));
  }, [opportunities, q]);

  if (!loaded) return <div className="text-sm text-slate-400">Loading…</div>;

  return (
    <>
      <PageHeader
        title="Intake"
        description="Raw workflow friction submissions. The source of truth for what the submitter knows."
        action={
          <div className="flex gap-2">
            <Link href="/intake/import">
              <Button variant="secondary">
                <Sparkles className="h-4 w-4" /> Import from interview
              </Button>
            </Link>
            <Link href="/intake/new">
              <Button>New Intake</Button>
            </Link>
          </div>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by name, ID, team, submitter…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No matching intakes"
          description="Submit a workflow that feels repetitive, manual, error-prone, or slow."
          action={
            <Link href="/intake/new">
              <Button>New Intake</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Hrs/mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ o, s }) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      <Link href={`/opportunities/${o.id}`} className="hover:text-navy">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/opportunities/${o.id}`}
                        className="font-medium text-slate-800 hover:text-navy"
                      >
                        {o.workflowName || "(untitled)"}
                      </Link>
                      <div className="text-xs text-slate-400">{o.submittedBy}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {o.team || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {fmtDate(o.submittedDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={o.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-600">
                      {s.estMonthlyHours}
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
