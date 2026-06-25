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
} from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import {
  TEAMS,
  FREQUENCIES,
  FRICTION_TYPES,
  YES_NO_UNSURE,
  YES_NO_MAYBE,
  TIMELINES,
} from "@/lib/lists";
import { cn } from "@/lib/utils";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={description} />
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
    </Card>
  );
}

const Rating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={cn(
          "h-9 w-9 rounded-lg border text-sm font-medium transition-colors",
          value === n
            ? "border-navy bg-navy text-white"
            : "border-slate-300 bg-white text-slate-600 hover:border-navy-600"
        )}
      >
        {n}
      </button>
    ))}
  </div>
);

export default function NewIntakePage() {
  const router = useRouter();
  const { addOpportunity, newOpportunityId } = useStore();
  const [o, setO] = useState<Opportunity>(() =>
    blankOpportunity(newOpportunityId())
  );

  function set<K extends keyof Opportunity>(key: K, val: Opportunity[K]) {
    setO((prev) => ({ ...prev, [key]: val }));
  }

  function toggleFriction(f: string) {
    setO((prev) => ({
      ...prev,
      frictionTypes: prev.frictionTypes.includes(f)
        ? prev.frictionTypes.filter((x) => x !== f)
        : [...prev.frictionTypes, f],
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addOpportunity(o);
    router.push(`/opportunities/${o.id}`);
  }

  return (
    <form onSubmit={submit}>
      <PageHeader
        title="New Intake"
        description={`Capturing ${o.id}. Describe the workflow and its friction — not the AI idea.`}
        action={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Save Intake</Button>
          </div>
        }
      />

      <div className="space-y-5">
        <Section title="Basics">
          <Field label="Submitted by">
            <Input
              value={o.submittedBy}
              onChange={(e) => set("submittedBy", e.target.value)}
              placeholder="Your name"
            />
          </Field>
          <Field label="Team / Function">
            <Select
              options={TEAMS}
              placeholder="Select a team…"
              value={o.team}
              onChange={(e) => set("team", e.target.value)}
            />
          </Field>
          <Field
            label="Workflow / Task Name"
            hint="Name the actual work being performed, not the proposed AI idea."
            className="md:col-span-2"
          >
            <Input
              value={o.workflowName}
              onChange={(e) => set("workflowName", e.target.value)}
              placeholder="e.g., Weekly escalation summary for district admins"
            />
          </Field>
          <Field label="Workflow Owner">
            <Input
              value={o.workflowOwner}
              onChange={(e) => set("workflowOwner", e.target.value)}
            />
          </Field>
          <Field label="People Involved">
            <Input
              value={o.peopleInvolved}
              onChange={(e) => set("peopleInvolved", e.target.value)}
            />
          </Field>
          <Field label="Who uses the output?" className="md:col-span-2">
            <Input
              value={o.whoUsesOutput}
              onChange={(e) => set("whoUsesOutput", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="The Work" description="Why this workflow exists and what it supports.">
          <Field
            label="Purpose of the workflow"
            hint="Why this workflow exists and what business outcome it supports."
            className="md:col-span-2"
          >
            <Textarea
              value={o.purpose}
              onChange={(e) => set("purpose", e.target.value)}
            />
          </Field>
          <Field label="Decision / deliverable / outcome supported" className="md:col-span-2">
            <Textarea
              value={o.decisionSupported}
              onChange={(e) => set("decisionSupported", e.target.value)}
            />
          </Field>
          <Field
            label="What happens if this is late, wrong, or skipped?"
            hint="Describe the consequence of delay, error, or omission."
            className="md:col-span-2"
          >
            <Textarea
              value={o.whatHappensIfLate}
              onChange={(e) => set("whatHappensIfLate", e.target.value)}
            />
          </Field>
          <Field
            label="Current process summary"
            hint="What happens today. Capture current-state steps, handoffs, and manual effort — don't solve here."
            className="md:col-span-2"
          >
            <Textarea
              rows={4}
              value={o.currentProcess}
              onChange={(e) => set("currentProcess", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Effort & Frequency" description="Used to estimate time cost.">
          <Field label="Frequency" hint="How often this work occurs.">
            <Select
              options={FREQUENCIES}
              value={o.frequency}
              onChange={(e) => set("frequency", e.target.value as Opportunity["frequency"])}
            />
          </Field>
          <Field label="Minutes per run" hint="Active minutes each time it runs.">
            <NumberInput
              min={0}
              value={o.minutesPerRun}
              onValueChange={(n) => set("minutesPerRun", n)}
            />
          </Field>
          <Field label="People doing this work">
            <NumberInput
              min={1}
              value={o.peopleDoingWork}
              onValueChange={(n) => set("peopleDoingWork", n)}
            />
          </Field>
          <Field label="Outputs / items per cycle">
            <Input
              value={o.outputsPerCycle}
              onChange={(e) => set("outputsPerCycle", e.target.value)}
            />
          </Field>
          <Field label="Systems / tools involved">
            <Input
              value={o.systemsInvolved}
              onChange={(e) => set("systemsInvolved", e.target.value)}
              placeholder="e.g., Zendesk, Google Sheets, Gmail"
            />
          </Field>
          <Field label="Number of systems">
            <NumberInput
              min={0}
              value={o.numberOfSystems}
              onValueChange={(n) => set("numberOfSystems", n)}
            />
          </Field>
        </Section>

        <Section title="Friction & Pain">
          <Field label="Friction types" hint="Multiple may apply." className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              {FRICTION_TYPES.map((f) => {
                const on = o.frictionTypes.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFriction(f)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      on
                        ? "border-navy bg-navy-50 text-navy"
                        : "border-slate-300 bg-white text-slate-600 hover:border-navy-600"
                    )}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Pain rating (1–5)">
            <Rating value={o.painRating} onChange={(n) => set("painRating", n)} />
          </Field>
          <Field label="Business criticality (1–5)">
            <Rating
              value={o.businessCriticality}
              onChange={(n) => set("businessCriticality", n)}
            />
          </Field>
          <Field label="Error-proneness (1–5)">
            <Rating
              value={o.errorProneness}
              onChange={(n) => set("errorProneness", n)}
            />
          </Field>
          <Field label="Urgency (1–5)">
            <Rating value={o.urgency} onChange={(n) => set("urgency", n)} />
          </Field>
          <Field label="Internal people affected">
            <NumberInput
              min={0}
              value={o.peopleAffected}
              onValueChange={(n) => set("peopleAffected", n)}
            />
          </Field>
          <Field label="Customers / districts / students affected">
            <Input
              value={o.customersAffected}
              onChange={(e) => set("customersAffected", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Future State & Guardrails">
          <Field label="Desired future state" className="md:col-span-2">
            <Textarea
              value={o.desiredFutureState}
              onChange={(e) => set("desiredFutureState", e.target.value)}
            />
          </Field>
          <Field label="What should still require human review?">
            <Textarea
              value={o.humanReview}
              onChange={(e) => set("humanReview", e.target.value)}
            />
          </Field>
          <Field label="What should never be automated?">
            <Textarea
              value={o.neverAutomate}
              onChange={(e) => set("neverAutomate", e.target.value)}
            />
          </Field>
          <Field label="What would make you trust the improved workflow?">
            <Textarea
              value={o.trust}
              onChange={(e) => set("trust", e.target.value)}
            />
          </Field>
          <Field label="What would make this unusable?">
            <Textarea
              value={o.unusable}
              onChange={(e) => set("unusable", e.target.value)}
            />
          </Field>
          <Field label="How would we know this worked?" className="md:col-span-2">
            <Textarea
              value={o.howWouldWeKnow}
              onChange={(e) => set("howWouldWeKnow", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Data & Risk">
          <Field label="Sensitive data?" hint="Private, regulated, customer, student, financial, etc.">
            <Select
              options={YES_NO_UNSURE}
              value={o.sensitiveData}
              onChange={(e) => set("sensitiveData", e.target.value as Opportunity["sensitiveData"])}
            />
          </Field>
          <Field label="Data types involved">
            <Input
              value={o.dataTypes}
              onChange={(e) => set("dataTypes", e.target.value)}
            />
          </Field>
          <Field label="Input data location">
            <Input
              value={o.inputDataLocation}
              onChange={(e) => set("inputDataLocation", e.target.value)}
            />
          </Field>
          <Field label="Output destination">
            <Input
              value={o.outputDestination}
              onChange={(e) => set("outputDestination", e.target.value)}
            />
          </Field>
          <Field label="Existing reports / exports / templates?">
            <Input
              value={o.existingReports}
              onChange={(e) => set("existingReports", e.target.value)}
            />
          </Field>
          <Field label="Example link">
            <Input
              value={o.exampleLink}
              onChange={(e) => set("exampleLink", e.target.value)}
              placeholder="https://"
            />
          </Field>
        </Section>

        <Section title="Logistics">
          <Field label="Available for live walkthrough?">
            <Select
              options={YES_NO_MAYBE}
              value={o.availableForWalkthrough}
              onChange={(e) =>
                set("availableForWalkthrough", e.target.value as Opportunity["availableForWalkthrough"])
              }
            />
          </Field>
          <Field label="Prototype willingness">
            <Select
              options={YES_NO_MAYBE}
              value={o.prototypeWillingness}
              onChange={(e) =>
                set("prototypeWillingness", e.target.value as Opportunity["prototypeWillingness"])
              }
            />
          </Field>
          <Field label="Ideal timeline">
            <Select
              options={TIMELINES}
              placeholder="No specific timeline"
              value={o.idealTimeline}
              onChange={(e) => set("idealTimeline", e.target.value as Opportunity["idealTimeline"])}
            />
          </Field>
          <Field label="Initial notes" className="md:col-span-2">
            <Textarea
              value={o.initialNotes}
              onChange={(e) => set("initialNotes", e.target.value)}
            />
          </Field>
        </Section>

        <div className="flex justify-end gap-2 pb-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Save Intake</Button>
        </div>
      </div>
    </form>
  );
}
