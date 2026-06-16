import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, BookOpen, MessageSquare, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCounter } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workplace AI" },
      { name: "description", content: "Your AI productivity overview at a glance." },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { key: "email", label: "Emails generated", icon: Mail, href: "/email" },
  { key: "meeting", label: "Meetings summarized", icon: FileText, href: "/summarize" },
  { key: "task", label: "Plans created", icon: CalendarClock, href: "/planner" },
  { key: "research", label: "Research briefs", icon: BookOpen, href: "/research" },
  { key: "chat", label: "Chat sessions", icon: MessageSquare, href: "/chat" },
] as const;

const TOOLS = [
  {
    title: "Smart Email Generator",
    description: "Draft professional emails in seconds with a chosen tone.",
    href: "/email",
    icon: Mail,
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Turn long notes into summary, decisions, action items, and deadlines.",
    href: "/summarize",
    icon: FileText,
  },
  {
    title: "AI Task Planner",
    description: "Get an optimized, time-blocked schedule from your task list.",
    href: "/planner",
    icon: CalendarClock,
  },
  {
    title: "AI Research Assistant",
    description: "Quick briefings on any workplace topic with key insights.",
    href: "/research",
    icon: BookOpen,
  },
  {
    title: "AI Chatbot",
    description: "An interactive assistant for everyday workplace questions.",
    href: "/chat",
    icon: MessageSquare,
  },
] as const;

function Dashboard() {
  const [, force] = useState(0);
  useEffect(() => {
    const tick = () => force((n) => n + 1);
    window.addEventListener("wpa:counter", tick);
    window.addEventListener("storage", tick);
    return () => {
      window.removeEventListener("wpa:counter", tick);
      window.removeEventListener("storage", tick);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeader
        title="Productivity overview"
        description="Your AI tools and today's activity, all in one place."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATS.map((s) => {
          const count = getCounter(s.key);
          return (
            <Link key={s.key} to={s.href} className="group">
              <Card className="transition-colors group-hover:border-primary/40">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Today
                    </span>
                  </div>
                  <div className="text-3xl font-semibold tabular-nums">{count}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Tools</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.href} to={t.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <t.icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <CardTitle className="mt-3 text-base">{t.title}</CardTitle>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
