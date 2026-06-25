import { Pill } from "./ui";

export function PriorityBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    "Quick Win": "bg-green-100 text-green-800",
    "Discovery Needed": "bg-blue-100 text-blue-800",
    "Strategic Project": "bg-purple-100 text-purple-800",
    "High Risk / Needs Review": "bg-red-100 text-red-800",
    "Process Issue": "bg-amber-100 text-amber-800",
    "Not a Fit": "bg-slate-200 text-slate-600",
  };
  if (!value) return <span className="text-slate-300">—</span>;
  return <Pill className={map[value] || "bg-slate-100 text-slate-600"}>{value}</Pill>;
}

export function RiskBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-green-100 text-green-800",
    Unknown: "bg-slate-200 text-slate-600",
  };
  if (!value) return <span className="text-slate-300">—</span>;
  return <Pill className={map[value] || "bg-slate-100 text-slate-600"}>{value}</Pill>;
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    New: "bg-slate-100 text-slate-700",
    "Needs Discovery": "bg-blue-100 text-blue-700",
    "Discovery Scheduled": "bg-blue-100 text-blue-700",
    "Discovery Complete": "bg-indigo-100 text-indigo-700",
    "Prototype Candidate": "bg-purple-100 text-purple-700",
    "In Prototype": "bg-purple-100 text-purple-700",
    Implemented: "bg-green-100 text-green-700",
    Parked: "bg-amber-100 text-amber-700",
    "Not a Fit": "bg-slate-200 text-slate-600",
  };
  if (!value) return <span className="text-slate-300">—</span>;
  return <Pill className={map[value] || "bg-slate-100 text-slate-600"}>{value}</Pill>;
}

export function ScoreBadge({ value }: { value: number }) {
  let cls = "bg-slate-100 text-slate-500";
  if (value >= 20) cls = "bg-green-100 text-green-800";
  else if (value >= 10) cls = "bg-amber-100 text-amber-800";
  else if (value > 0) cls = "bg-red-100 text-red-800";
  return (
    <Pill className={cls}>
      <span className="tabular-nums font-semibold">{value}</span>
    </Pill>
  );
}
