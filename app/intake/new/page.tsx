"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, blankOpportunity } from "@/lib/store";
import { IntakeForm } from "@/components/IntakeForm";

export default function NewIntakePage() {
  const router = useRouter();
  const { addOpportunity, newOpportunityId } = useStore();
  // Stable blank draft; the real ID is assigned at submit (once data is loaded).
  const [initial] = useState(() => blankOpportunity(""));

  return (
    <IntakeForm
      title="New Intake"
      description="Describe the workflow and its friction — not the AI idea."
      initial={initial}
      submitLabel="Save Intake"
      onCancel={() => router.back()}
      onSubmit={(o) => {
        const id = newOpportunityId();
        addOpportunity({ ...o, id });
        router.push(`/opportunities/${id}`);
      }}
    />
  );
}
