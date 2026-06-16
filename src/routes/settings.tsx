import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearAllData } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Workplace AI" },
      { name: "description", content: "Workplace AI settings and local data controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your local data and learn about the assistant." />
      <ResponsibleAINotice />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI model</CardTitle>
          <CardDescription>
            Powered by Lovable AI. All requests are processed server-side; the model used is
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              google/gemini-3-flash-preview
            </span>
            .
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Local data</CardTitle>
          <CardDescription>
            Drafts, chat history, and daily counters are stored only in this browser. Clearing them
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              clearAllData();
              toast.success("All local data cleared");
            }}
          >
            <Trash2 /> Clear all local data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
