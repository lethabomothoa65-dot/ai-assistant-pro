import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

async function run(system: string, prompt: string) {
  const gateway = getGateway();
  try {
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system,
      prompt,
    });
    return { text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    if (msg.includes("429")) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits in your workspace billing.");
    throw new Error(msg);
  }
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      recipient: z.string().min(1).max(200),
      subject: z.string().max(200).optional().default(""),
      purpose: z.string().min(1).max(2000),
      keyPoints: z.string().max(4000).optional().default(""),
      tone: z.enum(["Formal", "Friendly", "Persuasive", "Professional", "Apologetic"]),
    }),
  )
  .handler(async ({ data }) => {
    const system =
      "You are a Professional Email Assistant. Generate a polished workplace email. Output ONLY the email itself starting with 'Subject:' on the first line, then a blank line, then the body. Do not include explanations, markdown fences, or commentary.";
    const prompt = `Write a workplace email.

Recipient: ${data.recipient}
${data.subject ? `Suggested subject: ${data.subject}` : ""}
Tone: ${data.tone}
Purpose: ${data.purpose}
${data.keyPoints ? `Key points to include:\n${data.keyPoints}` : ""}`;
    return run(system, prompt);
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notes: z.string().min(10).max(20000) }))
  .handler(async ({ data }) => {
    const system =
      "You are a Meeting Analyst. Analyze meeting notes and produce a clear structured summary. Use plain text with these exact section headings (no markdown fences): 'Summary', 'Decisions', 'Action Items', 'Deadlines'. Use bullet points starting with '- '. Be concise and faithful to the notes.";
    return run(system, `Meeting notes:\n\n${data.notes}`);
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tasks: z.string().min(1).max(5000),
      hours: z.number().min(1).max(24),
      startTime: z.string().max(10).optional().default("09:00"),
    }),
  )
  .handler(async ({ data }) => {
    const system =
      "You are a Productivity Coach. Build an optimized time-blocked daily schedule. Output ONLY the schedule as plain text lines in the form 'HH:MM - HH:MM  Task name'. Place high-priority items earlier, include short breaks, and respect the available hours. No commentary.";
    const prompt = `Tasks:\n${data.tasks}\n\nAvailable hours: ${data.hours}\nStart time: ${data.startTime}`;
    return run(system, prompt);
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic: z.string().min(1).max(500),
      context: z.string().max(20000).optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    const system =
      "You are a Research Assistant for busy professionals. Produce a clear briefing with these exact section headings (no markdown fences): 'Summary', 'Key Insights', 'Opportunities', 'Recommendations'. Use '- ' bullets. Be concise, factual, and avoid speculation.";
    const prompt = `Topic: ${data.topic}${data.context ? `\n\nReference material:\n${data.context}` : ""}`;
    return run(system, prompt);
  });
