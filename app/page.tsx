"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { computeScore } from "@/lib/scoring";
import { Card, CardHeader, Button, Pill } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { PriorityBadge } from "@/components/badges";
import { fmtHours, fmtDate } from "@/lib/utils";
import type { Opportunity } from "@/lib/types";
import {
  Inbox,
  Zap,
  Search,
  Building2,
  AlertTriangle,
  Clock,
  CalendarClock,
  Gauge,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

// Rules for the "Needs your attention" queue. One row per opportunity — the
// single most urgent reason it's waiting on you, in this priority order.
type AttnKind = "overdue" | "risk" | "triage" | "stalled" | "quickwin";

const ATTN: Record<
  AttnKind,
  {
    label: string;
    icon: React.ElementType;
    accent: string;
    detail: (o: Opportunity) => string;
    cta: string;
    href: (o: Opportunity) => string;
  }
> = {
  overdue: {
    label: "Review overdue",
    icon: CalendarClock,
    accent: "bg-red-100 text-red-700",
    detail: (o) => `Review was due ${fmtDate(o.nextReviewDate)}`,
    cta: "Open brief",
    href: (o) => `/opportunities/${o.id}`,
  },
  risk: {
    label: "Awaiting risk review",
    icon: ShieldAlert,
    accent: "bg-red-100 text-red-700",
    detail: () => "Review with Security / Legal / Data owner before solutioning",
    cta: "Open brief",
    href: (o) => `/opportunities/${o.id}`,
  },
  triage: {
    label: "Needs triage",
    icon: ClipboardList,
    accent: "bg-navy-50 text-navy",
    detail: () => "New intake — set status, feasibility, and risk",
    cta: "Triage",
    href: (o) => `/opportunities/${o.id}`,
  },
  stalled: {
    label: "Discovery not started",
    icon: Search,
    accent: "bg-amber-100 text-amber-700",
    detail: () => "Marked for discovery, but no session logged yet",
    cta: "Open discovery",
    href: (o) => `/discovery?opp=${o.id}`,
  },
  quickwin: {
    label: "Quick win ready",
    icon: Zap,
    accent: "bg-green-100 text-green-700",
    detail: () => "High score and easy — schedule prototype scoping",
    cta: "Open brief",
    href: (o) => `/opportunities/${o.id}`,
  },
};

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold tabular-nums text-slate-900">
            {value}
          </div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function BarRow({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-44 shrink-0 truncate text-xs text-slate-600">{label}</div>
      <div className="flex-1">
        <div className="h-5 rounded bg-slate-100">
          <div
            className={`h-5 rounded ${color}`}
            style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
          />
        </div>
      </div>
      <div className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
        {count}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { opportunities, sessions, loaded } = useStore();

  const scored = useMemo(
    () => opportunities.map((o) => ({ o, s: computeScore(o) })),
    [opportunities]
  );

  const stats = useMemo(() => {
    const cat = (c: string) =>
      scored.filter((x) => x.s.priorityCategory === c).length;
    const monthly = scored.reduce((a, x) => a + x.s.estMonthlyHours, 0);
    const annual = scored.reduce((a, x) => a + x.s.annualizedHours, 0);
    const scores = scored.map((x) => x.s.priorityScore).filter((n) => n > 0);
    const avg = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    const oppsWithDiscovery = new Set(sessions.map((s) => s.opportunityId)).size;
    return {
      total: opportunities.length,
      quickWin: cat("Quick Win"),
      discovery: cat("Discovery Needed"),
      strategic: cat("Strategic Project"),
      highRisk: cat("High Risk / Needs Review"),
      monthly: Math.round(monthly * 10) / 10,
      annual: Math.round(annual * 10) / 10,
      avg: Math.round(avg * 10) / 10,
      sessions: sessions.length,
      oppsWithDiscovery,
    };
  }, [scored, sessions, opportunities.length]);

  const byCategory = useMemo(() => {
    const cats = [
      "Quick Win",
      "Discovery Needed",
      "Strategic Project",
      "High Risk / Needs Review",
      "Process Issue",
      "Not a Fit",
    ];
    const colors: Record<string, string> = {
      "Quick Win": "bg-green-500",
      "Discovery Needed": "bg-blue-500",
      "Strategic Project": "bg-purple-500",
      "High Risk / Needs Review": "bg-red-500",
      "Process Issue": "bg-amber-500",
      "Not a Fit": "bg-slate-400",
    };
    const rows = cats.map((c) => ({
      label: c,
      count: scored.filter((x) => x.s.priorityCategory === c).length,
      color: colors[c],
    }));
    return { rows, max: Math.max(1, ...rows.map((r) => r.count)) };
  }, [scored]);

  const byTeamHours = useMemo(() => {
    const m = new Map<string, number>();
    for (const { o, s } of scored) {
      if (!o.team) continue;
      m.set(o.team, (m.get(o.team) || 0) + s.estMonthlyHours);
    }
    const rows = [...m.entries()]
      .map(([label, count]) => ({
        label,
        count: Math.round(count * 10) / 10,
        color: "bg-navy-600",
      }))
      .sort((a, b) => b.count - a.count);
    return { rows, max: Math.max(1, ...rows.map((r) => r.count)) };
  }, [scored]);

  const topOpps = useMemo(
    () =>
      [...scored]
        .sort((a, b) => b.s.priorityScore - a.s.priorityScore)
        .slice(0, 5),
    [scored]
  );

  const attention = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const discovered = new Set(sessions.map((s) => s.opportunityId));
    const order: AttnKind[] = ["overdue", "risk", "triage", "stalled", "quickwin"];
    const items: { o: Opportunity; kind: AttnKind }[] = [];
    for (const { o, s } of scored) {
      const terminal =
        o.status === "Implemented" ||
        o.status === "Parked" ||
        o.status === "Not a Fit";
      let kind: AttnKind | null = null;
      if (o.nextReviewDate && o.nextReviewDate <= today && !terminal) {
        kind = "overdue";
      } else if (s.priorityCategory === "High Risk / Needs Review" && !terminal) {
        kind = "risk";
      } else if (o.status === "New") {
        kind = "triage";
      } else if (
        (o.status === "Needs Discovery" || o.status === "Discovery Scheduled") &&
        !discovered.has(o.id)
      ) {
        kind = "stalled";
      } else if (s.priorityCategory === "Quick Win" && !terminal) {
        kind = "quickwin";
      }
      if (kind) items.push({ o, kind });
    }
    items.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
    return items;
  }, [scored, sessions]);

  if (!loaded) return <div className="text-sm text-slate-400">Loading…</div>;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Portfolio view of the workflow friction pipeline. For details on any opportunity, open its brief from Triage & Scoring."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Total Opportunities" value={stats.total} icon={Inbox} accent="bg-slate-100 text-slate-700" />
        <Kpi label="Quick Wins" value={stats.quickWin} icon={Zap} accent="bg-green-100 text-green-700" />
        <Kpi label="Discovery Needed" value={stats.discovery} icon={Search} accent="bg-blue-100 text-blue-700" />
        <Kpi label="Strategic Projects" value={stats.strategic} icon={Building2} accent="bg-purple-100 text-purple-700" />
        <Kpi label="High Risk / Review" value={stats.highRisk} icon={AlertTriangle} accent="bg-red-100 text-red-700" />
        <Kpi label="Est. Monthly Hours" value={fmtHours(stats.monthly)} icon={Clock} accent="bg-amber-100 text-amber-700" />
        <Kpi label="Est. Annual Hours" value={fmtHours(stats.annual)} icon={CalendarClock} accent="bg-amber-100 text-amber-700" />
        <Kpi label="Avg Priority Score" value={stats.avg || "—"} icon={Gauge} accent="bg-navy-50 text-navy" />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Needs your attention"
          subtitle="What's waiting on you right now — work these first."
        />
        {attention.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-8 text-sm text-slate-500">
            <CheckCircle2 className="h-5 w-5 text-clever-green" />
            You&rsquo;re all caught up — nothing is waiting on you.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {attention.map(({ o, kind }) => {
              const meta = ATTN[kind];
              const Icon = meta.icon;
              return (
                <Link
                  key={`${o.id}-${kind}`}
                  href={meta.href(o)}
                  className="group flex items-center gap-4 px-5 py-3 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.accent}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-800">
                        {o.workflowName || "(untitled)"}
                      </span>
                      <Pill className="bg-slate-100 text-slate-600">{meta.label}</Pill>
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {o.id} · {meta.detail(o)}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-clever-blue">
                    {meta.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Opportunities by Priority Category" />
          <div className="px-5 py-4">
            {byCategory.rows.map((r) => (
              <BarRow key={r.label} {...r} max={byCategory.max} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Estimated Monthly Hours by Team"
            subtitle="Where friction concentrates across the org"
          />
          <div className="px-5 py-4">
            {byTeamHours.rows.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No team data yet.
              </p>
            ) : (
              byTeamHours.rows.map((r) => (
                <BarRow key={r.label} {...r} max={byTeamHours.max} />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Top Priorities"
          subtitle="Highest priority score — sort, then apply judgment"
          action={
            <Link href="/opportunities">
              <Button variant="secondary" size="sm">
                View all
              </Button>
            </Link>
          }
        />
        <div className="divide-y divide-slate-100">
          {topOpps.map(({ o, s }) => (
            <Link
              key={o.id}
              href={`/opportunities/${o.id}`}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-800">
                  {o.workflowName || "(untitled)"}
                </div>
                <div className="text-xs text-slate-500">
                  {o.id} · {o.team || "—"} · {fmtHours(s.estMonthlyHours)} hrs/mo
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <PriorityBadge value={s.priorityCategory} />
                <span className="w-10 text-right text-sm font-semibold tabular-nums text-slate-700">
                  {s.priorityScore}
                </span>
              </div>
            </Link>
          ))}
          {topOpps.length === 0 && (
            <p className="px-5 py-8 text-center text-xs text-slate-400">
              No opportunities yet. Add one from Intake.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
