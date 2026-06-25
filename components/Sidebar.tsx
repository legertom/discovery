"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Inbox,
  Target,
  Search,
  Settings,
  Compass,
  Sparkles,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/guide", label: "How it works", icon: Compass },
  { href: "/intake", label: "Intake", icon: Inbox },
  { href: "/opportunities", label: "Triage & Scoring", icon: Target },
  { href: "/discovery", label: "Discovery", icon: Search },
  { href: "/settings", label: "Lists & Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-clever-blue text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-serif text-sm font-bold text-clever-navy">
            AI Enablement
          </div>
          <div className="text-[11px] text-slate-500">Workflow Discovery</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-navy-50 text-navy"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
