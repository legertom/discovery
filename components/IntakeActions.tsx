"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button, Tooltip } from "./ui";

// The standard pair of intake entry points. Use this anywhere a "New Intake"
// action belongs so the AI-import path is always offered alongside it.
export function IntakeActions() {
  return (
    <div className="flex gap-2">
      <Tooltip label="Paste a Granola summary or transcript from an intake interview. AI drafts a new intake from your notes — you review and edit before saving.">
        <Link href="/intake/import">
          <Button variant="secondary">
            <Sparkles className="h-4 w-4" /> New intake from interview notes
          </Button>
        </Link>
      </Tooltip>
      <Link href="/intake/new">
        <Button>New Intake</Button>
      </Link>
    </div>
  );
}
