import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AIOutputPanel } from "@/components/ai-output-panel";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";
import { getDraft, incrementCounter, setDraft } from "@/lib/storage";

export const Route = createFileRoute("/summarize")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Workplace AI" },
      {
        name: "description",
        content: "Turn long meeting notes into a structured summary in seconds.",
      },
    ],
  }),
  component: SummarizePage,
});

function SummarizePage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState(() => getDraft("meeting"));
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (notes.trim().length < 20) {
      toast.error("Paste your meeting notes first.");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { notes } });
      setOutput(text);
      setDraft("meeting", text);
      incrementCounter("meeting");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Meeting Notes Summarizer"
        description="Get a clean summary with decisions, action items, and deadlines."
      />
      <ResponsibleAINotice />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Meeting notes</Label>
              <Textarea
                id="notes"
                placeholder="Paste meeting notes here…"
                rows={18}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "Summarizing…" : "Summarize meeting"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Label className="mb-3 block">Structured summary</Label>
            <AIOutputPanel
              value={output}
              onChange={(v) => {
                setOutput(v);
                setDraft("meeting", v);
              }}
              onRegenerate={generate}
              loading={loading}
              downloadFilename="meeting-summary.txt"
              rows={18}
              placeholder="Summary, decisions, action items, and deadlines will appear here."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
