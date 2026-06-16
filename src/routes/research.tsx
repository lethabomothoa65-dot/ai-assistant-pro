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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { researchTopic } from "@/lib/ai.functions";
import { getDraft, incrementCounter, setDraft } from "@/lib/storage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Workplace AI" },
      { name: "description", content: "Quick AI briefings on any workplace topic." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState(() => getDraft("research"));
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!topic.trim()) {
      toast.error("Enter a topic.");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { topic, context } });
      setOutput(text);
      setDraft("research", text);
      incrementCounter("research");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="AI Research Assistant"
        description="Get a structured briefing — summary, insights, opportunities, and recommendations."
      />
      <ResponsibleAINotice />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Artificial Intelligence in Healthcare"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Reference material (optional)</Label>
              <Textarea
                id="context"
                placeholder="Paste an article, notes, or URL contents here…"
                rows={12}
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "Researching…" : "Generate briefing"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Label className="mb-3 block">Briefing</Label>
            <AIOutputPanel
              value={output}
              onChange={(v) => {
                setOutput(v);
                setDraft("research", v);
              }}
              onRegenerate={generate}
              loading={loading}
              downloadFilename="research-brief.txt"
              rows={18}
              placeholder="Your research briefing will appear here."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
