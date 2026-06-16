import type { UIMessage } from "ai";

const PREFIX = "wpa:";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type CounterName = "email" | "meeting" | "task" | "research" | "chat";

export function getCounter(name: CounterName): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(`${PREFIX}count:${name}:${todayKey()}`);
  return raw ? Number(raw) || 0 : 0;
}

export function incrementCounter(name: CounterName) {
  if (typeof window === "undefined") return;
  const k = `${PREFIX}count:${name}:${todayKey()}`;
  const next = (Number(window.localStorage.getItem(k)) || 0) + 1;
  window.localStorage.setItem(k, String(next));
  window.dispatchEvent(new Event("wpa:counter"));
}

export function getDraft(key: string): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(`${PREFIX}draft:${key}`) ?? "";
}

export function setDraft(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${PREFIX}draft:${key}`, value);
}

const CHAT_KEY = `${PREFIX}chat:messages`;

export function loadChatMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveChatMessages(messages: UIMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}

export function clearChatMessages() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAT_KEY);
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => window.localStorage.removeItem(k));
  window.dispatchEvent(new Event("wpa:counter"));
}
