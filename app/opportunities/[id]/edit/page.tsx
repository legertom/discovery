"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { IntakeForm } from "@/components/IntakeForm";
import { Button, EmptyState } from "@/components/ui";

export default function EditIntakePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { opportunities, updateOpportunity, loaded } = useStore();

  const o = opportunities.find((x) => x.id === id);

  if (!loaded) return <div className="text-sm text-slate-400">Loading…</div>;
  if (!o)
    return (
      <EmptyState
        title="Opportunity not found"
        description={`No record for ${id}.`}
        action={
          <Link href="/opportunities">
            <Button>Back to Triage</Button>
          </Link>
        }
      />
    );

  return (
    <IntakeForm
      key={o.id}
      title={`Edit ${o.id}`}
      description="Update the intake details. Triage fields (status, risk, etc.) are edited on the brief."
      initial={o}
      submitLabel="Save changes"
      onCancel={() => router.push(`/opportunities/${id}`)}
      onSubmit={(updated) => {
        updateOpportunity(id, updated);
        router.push(`/opportunities/${id}`);
      }}
    />
  );
}
