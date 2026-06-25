import Link from "next/link";
import type { ReactNode } from "react";
import {
  Inbox,
  Target,
  Search,
  FileText,
  ArrowRight,
  Gauge,
  MessageCircleQuestion,
  Compass,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "How it works — AI Enablement",
};

/* ------------------------------------------------------------------ */
/* Brand decoration: the Clever "constellation" line-art motif.        */
/* ------------------------------------------------------------------ */
function Constellation({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1">
        <ellipse cx="360" cy="120" rx="150" ry="60" transform="rotate(-18 360 120)" />
        <ellipse cx="360" cy="120" rx="110" ry="40" transform="rotate(-18 360 120)" />
        <ellipse cx="360" cy="120" rx="70" ry="22" transform="rotate(-18 360 120)" />
      </g>
      <g fill="#FFFFFF">
        <circle cx="360" cy="120" r="4" fillOpacity="0.95" />
        <circle cx="476" cy="86" r="2.5" fillOpacity="0.7" />
        <circle cx="250" cy="150" r="2" fillOpacity="0.6" />
        <circle cx="300" cy="64" r="1.6" fillOpacity="0.5" />
        <circle cx="430" cy="190" r="1.6" fillOpacity="0.5" />
      </g>
      <g fill="#FFE478">
        <circle cx="408" cy="92" r="2.4" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The four-stage process flow — the Clever numbered-step motif.       */
/* ------------------------------------------------------------------ */
const STAGES = [
  { n: 1, label: "Capture", icon: Inbox, blurb: "Record the friction" },
  { n: 2, label: "Triage", icon: Target, blurb: "Quantify & prioritize" },
  { n: 3, label: "Discover", icon: Search, blurb: "Walk the real workflow" },
  { n: 4, label: "Brief", icon: FileText, blurb: "Align stakeholders" },
];

function StageFlow() {
  return (
    <div className="relative">
      {/* connecting line */}
      <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-clever-sky sm:block" />
      <ol className="relative grid gap-6 sm:grid-cols-4">
        {STAGES.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.n} className="flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-clever-blue text-white shadow-md ring-4 ring-white">
                <Icon className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-clever-navy text-[11px] font-bold text-white">
                  {s.n}
                </span>
              </div>
              <div className="mt-3 font-serif text-base font-bold text-clever-navy">
                {s.label}
              </div>
              <div className="text-xs text-slate-500">{s.blurb}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detailed per-stage section.                                         */
/* ------------------------------------------------------------------ */
function StageDetail({
  n,
  icon: Icon,
  title,
  why,
  inApp,
  good,
  href,
  cta,
}: {
  n: number;
  icon: React.ElementType;
  title: string;
  why: string;
  inApp: string;
  good: ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-clever-sky text-clever-blue">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-clever-blue">
            Stage {n}
          </div>
          <h3 className="font-serif text-lg font-bold text-clever-navy">{title}</h3>
        </div>
      </div>
      <div className="grid gap-5 px-6 py-5 sm:grid-cols-3">
        <div>
          <div className="text-xs font-semibold text-slate-400">Why it matters</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{why}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400">In the app</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{inApp}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400">What good looks like</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-700">{good}</div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-6 py-3">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-clever-blue hover:underline"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 font-serif text-2xl font-bold text-clever-navy">
      {children}
    </h2>
  );
}

const QUESTIONS = [
  "Walk me through the last time you did this, start to finish.",
  "Where do you get the information you need to start?",
  "What happens to the output — who is waiting on it downstream?",
  "Which step takes the longest? Which one is the most annoying?",
  "Where do mistakes usually creep in?",
  "What part needs your judgment that a tool couldn't make for you?",
  "What would have to be true for you to trust this running automatically?",
  "What should never be automated here, no matter what?",
  "If this were late, wrong, or skipped, what breaks?",
];

const PRINCIPLES = [
  {
    title: "Score sorts, judgment decides",
    body: "The priority score is a directional signal to order your list — not a verdict. Always apply judgment on top.",
  },
  {
    title: "Quantify everything you can",
    body: "Minutes per run, frequency, people involved. Numbers turn opinions into a comparable portfolio.",
  },
  {
    title: "Surface risk early",
    body: "Sensitive data and high-risk workflows go to review before solutioning — not after a prototype exists.",
  },
  {
    title: "Capture guardrails, not just pain",
    body: "What must stay human, what would build trust, what would make a solution unusable. These shape the build.",
  },
  {
    title: "Every session ends with a next step",
    body: "A recommended action and an owner. Discovery that doesn't name the next move tends to stall.",
  },
  {
    title: "Describe actions, not solutions",
    body: "In intake and step logs, capture what actually happens. The solution comes later, once you understand the work.",
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-clever-navy px-8 py-12">
        <Constellation className="pointer-events-none absolute -right-6 -top-6 h-72 w-[30rem] opacity-90" />
        <div className="relative max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-clever-sky">
            <Compass className="h-3.5 w-3.5" /> The method
          </div>
          <h1 className="font-serif text-4xl font-black leading-tight text-white">
            <span className="text-clever-orange">How</span> workflow
            <br className="hidden sm:block" /> discovery works
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-clever-sky">
            This app runs a consultative process for turning everyday workflow
            friction into well-understood, AI-enabled improvements. Four stages,
            one shared playbook — so anyone can follow along.
          </p>
        </div>
      </section>

      {/* The idea */}
      <section>
        <SectionHeading>The big idea</SectionHeading>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <p className="max-w-3xl text-[15px] leading-relaxed text-slate-700">
            Across the company, people quietly absorb repetitive, manual, slow, or
            error-prone work. Most of it never gets named, so it never gets fixed.
            This practice makes that friction <strong>visible</strong>,{" "}
            <strong>comparable</strong>, and <strong>actionable</strong>: we capture
            it, quantify it, walk through the real workflow with the people who live
            it, and produce a brief that says whether — and how — to build an
            AI-enabled improvement. The goal isn&rsquo;t to automate everything; it&rsquo;s to
            apply judgment to the right things.
          </p>
        </div>
      </section>

      {/* Process flow */}
      <section>
        <SectionHeading>The four stages</SectionHeading>
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-card">
          <StageFlow />
        </div>
      </section>

      {/* Stage details */}
      <section className="space-y-5">
        <StageDetail
          n={1}
          icon={Inbox}
          title="Capture the friction"
          why="You can't improve a workflow nobody has named. Capture turns a vague 'this is annoying' into a concrete, comparable record."
          inApp="Submit an intake by hand, or paste interview notes and let AI draft the form for you to review and edit before saving."
          good={
            <>
              Concrete and quantified — minutes per run, how often, how many
              people. Describe the current process in plain steps, and be honest
              about pain and what must <em>never</em> be automated.
            </>
          }
          href="/intake"
          cta="Go to Intake"
        />
        <StageDetail
          n={2}
          icon={Target}
          title="Quantify and prioritize"
          why="You have more friction than time. Triage orders the list by impact, frequency, and friction — minus risk — so you work the highest-leverage items first."
          inApp="Every intake is auto-scored. Set Status, Solution Type, Feasibility, and Risk on the brief; the priority score and category update live."
          good={
            <>
              Treat the score as a starting point, not a verdict. Sort by it, then
              apply judgment. Flag anything sensitive for review early.
            </>
          }
          href="/opportunities"
          cta="Go to Triage & Scoring"
        />
        <StageDetail
          n={3}
          icon={Search}
          title="Walk the real workflow"
          why="An intake is what the submitter thinks happens. Discovery is where you watch the actual workflow and find the real steps, hand-offs, and judgment calls."
          inApp="Log a session summary, then build a step-by-step walkthrough. Tag each step: needs human judgment? could be automated? could be AI-assisted?"
          good={
            <>
              Watch the actual screen. Capture each step&rsquo;s input and output, note
              guardrails and &ldquo;never automate&rdquo; moments, and end every session with a
              recommended next step and an owner.
            </>
          }
          href="/discovery"
          cta="Go to Discovery"
        />
        <StageDetail
          n={4}
          icon={FileText}
          title="Brief the stakeholders"
          why="A decision needs a shareable artifact. Each opportunity page doubles as a one-page brief — the case for whether and how to build."
          inApp="The opportunity page pulls the intake, the live score, and all discovery sessions and steps into one view you can walk a stakeholder through."
          good={
            <>
              A clear recommendation, the time cost it would save, the guardrails
              that must hold, and the next step with an owner.
            </>
          }
          href="/opportunities"
          cta="Open any opportunity"
        />
      </section>

      {/* Scoring */}
      <section>
        <SectionHeading>How the priority score works</SectionHeading>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3 text-clever-navy">
            <Gauge className="h-5 w-5 text-clever-blue" />
            <span className="rounded-lg bg-clever-sky px-3 py-2 font-mono text-sm font-semibold text-clever-navy">
              Priority = Impact×2 + Frequency + Friction×2 + Feasibility − Risk×2
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { l: "Impact", d: "Business criticality and urgency, plus a bonus for hours spent per month." },
              { l: "Frequency", d: "How often the workflow runs — daily friction compounds faster than monthly." },
              { l: "Friction", d: "How painful and error-prone it is today." },
              { l: "Risk", d: "Sensitive data and risk level push an item toward review before solutioning." },
            ].map((x) => (
              <div key={x.l} className="rounded-lg border border-slate-200 p-4">
                <div className="font-serif text-base font-bold text-clever-navy">
                  {x.l}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            The score sorts your portfolio into categories — Quick Win, Discovery
            Needed, Strategic Project, High Risk / Needs Review, Process Issue, Not
            a Fit. It&rsquo;s directional: a fast way to decide what to look at next, not
            a decision in itself. The weights live in{" "}
            <Link href="/settings" className="font-medium text-clever-blue hover:underline">
              Lists &amp; Settings
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Question bank */}
      <section>
        <SectionHeading>Discovery question bank</SectionHeading>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <MessageCircleQuestion className="h-4 w-4 text-clever-blue" />
            Go-to questions for a workflow walkthrough.
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {QUESTIONS.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clever-blue text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-slate-700">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Principles */}
      <section>
        <SectionHeading>Principles we work by</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-clever-sky text-clever-blue">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="font-serif text-base font-bold text-clever-navy">
                {p.title}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="relative overflow-hidden rounded-2xl bg-clever-blue px-8 py-10">
        <Constellation className="pointer-events-none absolute -right-4 -top-8 h-64 w-96 opacity-80" />
        <div className="relative">
          <h2 className="font-serif text-2xl font-bold text-white">
            Ready to start?
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/90">
            Capture a workflow that feels repetitive, manual, slow, or error-prone —
            then let the process take it from there.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/intake/new"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-clever-navy hover:bg-clever-sky"
            >
              New intake <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/intake/import"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4" /> Import from interview notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
