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
import { planTasks } from "@/lib/ai.functions";
import { getDraft, incrementCounter, setDraft } from "@/lib/storage";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — Workplace AI" },
      { name: "description", content: "Generate an optimized daily schedule with AI." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState(8);
  const [startTime, setStartTime] = useState("09:00");
  const [output, setOutput] = useState(() => getDraft("planner"));
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!tasks.trim()) {
      toast.error("Add at least one task.");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { tasks, hours, startTime } });
      setOutput(text);
      setDraft("planner", text);
      incrementCounter("task");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="AI Task Planner"
        description="Turn a to-do list into a prioritized, time-blocked schedule."
      />
      <ResponsibleAINotice />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="tasks">Tasks</Label>
              <Textarea
                id="tasks"
                placeholder="- Finish report&#10;- Team meeting&#10;- Client call&#10;- Research competitors"
                rows={10}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start time</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Available hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, Math.min(24, Number(e.target.value) || 0)))}
                />
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "Planning…" : "Generate schedule"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Label className="mb-3 block">Your schedule</Label>
            <AIOutputPanel
              value={output}
              onChange={(v) => {
                setOutput(v);
                setDraft("planner", v);
              }}
              onRegenerate={generate}
              loading={loading}
              downloadFilename="schedule.txt"
              rows={16}
              placeholder="Your time-blocked schedule will appear here."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
