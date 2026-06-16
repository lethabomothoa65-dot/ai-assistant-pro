# AI Workplace Productivity Assistant — Build Plan

A single-user SaaS-style dashboard with 5 AI-powered features. All data stays in the browser (localStorage). No accounts. Clean minimal slate design (white/slate with blue accent).

## Design system
- Palette: bg `#FFFFFF`, surface `#F8FAFC`, ink `#0F172A`, primary `#3B82F6`
- Typography: Inter (body) + clean sans for headings — restrained, no gradients
- Sharp 8–12px radii, subtle borders, no glassmorphism (kept the spec's "clean" over its "glass")
- Light mode only initially; semantic tokens in `src/styles.css`

## Routes (TanStack Start, file-based)
```
src/routes/
  __root.tsx           shared sidebar shell + Responsible AI banner
  index.tsx            Dashboard (stat cards from localStorage counters)
  email.tsx            Smart Email Generator
  summarize.tsx        Meeting Notes Summarizer
  planner.tsx          AI Task Planner
  research.tsx         AI Research Assistant
  chat.tsx             AI Chatbot
  settings.tsx         Settings (clear data, model info)
  api/chat.ts          streaming chat endpoint (AI SDK)
```
Each route has its own `head()` metadata. Root has notFoundComponent; router has defaultErrorComponent.

## Shared UI
- `AppSidebar` (shadcn sidebar, collapsible icon mode, mobile hamburger via Sheet)
- `ResponsibleAINotice` banner shown on every AI feature page
- `AIOutputPanel` — editable textarea with Edit / Copy / Download / Regenerate actions, used by features 1–4
- shadcn: button, card, input, textarea, select, sidebar, sonner (toasts)

## AI integration (Lovable AI Gateway)
- Enable Lovable Cloud only to provision `LOVABLE_API_KEY` (no DB, no auth used)
- Server fns in `src/lib/ai.functions.ts` for one-shot calls (email, summarize, plan, research)
- Streaming chat via TanStack server route `src/routes/api/chat.ts` + `useChat` on client
- Model: `google/gemini-3-flash-preview` for all features
- Provider helper in `src/lib/ai-gateway.server.ts`

## Feature specs

**1. Smart Email Generator** — form (recipient, subject, purpose, key points, tone select) → server fn → editable draft in `AIOutputPanel`.

**2. Meeting Notes Summarizer** — textarea input → structured output (Summary / Decisions / Action Items / Deadlines) rendered as editable sections.

**3. AI Task Planner** — tasks list + available hours → returns timetable as editable text.

**4. AI Research Assistant** — topic + optional pasted article text → Summary / Insights / Recommendations.

**5. AI Chatbot** — AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`). One conversation persisted in localStorage under a single key; "New conversation" button clears it. Suggested prompts shown when empty. Uses `useChat` with `DefaultChatTransport`, message `parts` rendering, `MessageResponse` for markdown.

## Local persistence
- `src/lib/storage.ts` — typed get/set helpers for: chat messages, last drafts per feature, daily counters (emails/meetings/tasks/research/chat sessions) to power dashboard stats.

## Responsible AI
- Persistent footer-style banner on every AI feature page with the exact disclaimer text.

## Technical notes
- Install AI Elements: `bun x ai-elements@latest add conversation message prompt-input shimmer`
- Use `@tanstack/react-router` for Link/useNavigate, `@tanstack/react-start` for `createServerFn`
- Read `process.env.LOVABLE_API_KEY` inside server handlers only
- Validate all server fn inputs with zod
- Counters increment on successful generation; reset daily by date key
- Chat textarea kept focused on mount, after send, after clear

## Out of scope (since user chose local-only)
- No Supabase tables, no auth, no cross-device sync
- No dark mode toggle (can add later)
- No file upload / OCR
