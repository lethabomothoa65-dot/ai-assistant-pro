import { ShieldAlert } from "lucide-react";

export function ResponsibleAINotice() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-medium">Responsible AI notice:</span> AI-generated content may contain
        inaccuracies and should be reviewed before use. Do not share confidential, sensitive, or
        personal information with the AI assistant.
      </p>
    </div>
  );
}
