import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  clearChatMessages,
  incrementCounter,
  loadChatMessages,
  saveChatMessages,
} from "@/lib/storage";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace AI" },
      { name: "description", content: "Chat with an AI workplace productivity assistant." },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Summarize this report",
  "Draft an email to my team about a delay",
  "Plan my day around 3 meetings",
  "Research market trends in fintech",
];

function ChatPage() {
  const initialMessages = useMemo(() => loadChatMessages(), []);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const countedRef = useRef(initialMessages.length > 0);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "workplace-ai-chat",
    messages: initialMessages as UIMessage[],
    transport,
  });

  useEffect(() => {
    saveChatMessages(messages as UIMessage[]);
  }, [messages]);

  useEffect(() => {
    if (error) toast.error(error.message || "Chat error");
  }, [error]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const loading = status === "submitted" || status === "streaming";

  function focusInput() {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleSubmit(message: PromptInputMessage) {
    const text = (message.text ?? input).trim();
    if (!text) return;
    if (!countedRef.current) {
      incrementCounter("chat");
      countedRef.current = true;
    }
    sendMessage({ text });
    setInput("");
    focusInput();
  }

  function handleSuggestion(s: string) {
    if (!countedRef.current) {
      incrementCounter("chat");
      countedRef.current = true;
    }
    sendMessage({ text: s });
    focusInput();
  }

  function newConversation() {
    setMessages([]);
    clearChatMessages();
    countedRef.current = false;
    focusInput();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col gap-4">
      <PageHeader
        title="AI Workplace Assistant"
        description="Ask questions, draft content, or get advice on any workplace task."
        actions={
          <Button variant="outline" size="sm" onClick={newConversation} disabled={loading}>
            <Trash2 /> New conversation
          </Button>
        }
      />
      <ResponsibleAINotice />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <Conversation className="min-h-0 flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="How can I help today?"
                description="Try one of the prompts below or ask anything."
              >
                <div className="mt-4 grid w-full max-w-md gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                return (
                  <Message key={m.id} from={m.role === "user" ? "user" : "assistant"}>
                    <MessageContent>
                      {m.role === "assistant" ? (
                        <MessageResponse>{text}</MessageResponse>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
                      )}
                    </MessageContent>
                  </Message>
                );
              })
            )}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer>Thinking…</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t bg-background p-3">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message the workplace assistant…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() && !loading} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </Card>
    </div>
  );
}
