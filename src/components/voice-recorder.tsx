import { Loader2, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  onTranscript: (text: string) => void;
  transcribe: (args: { audioBase64: string; format: "webm" | "mp4" }) => Promise<string>;
  disabled?: boolean;
};

function pickMime(): { mime: string; format: "webm" | "mp4" } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates: Array<{ mime: string; format: "webm" | "mp4" }> = [
    { mime: "audio/webm;codecs=opus", format: "webm" },
    { mime: "audio/webm", format: "webm" },
    { mime: "audio/mp4", format: "mp4" },
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mime)) return c;
  }
  return null;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) {
    binary += String.fromCharCode(...buf.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function VoiceRecorder({ onTranscript, transcribe, disabled }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle");
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const formatRef = useRef<"webm" | "mp4">("webm");

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    const pick = pickMime();
    if (!pick) {
      toast.error("Voice recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream, { mimeType: pick.mime });
      formatRef.current = pick.format;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const blob = new Blob(chunksRef.current, { type: pick.mime });
        if (blob.size === 0) {
          setState("idle");
          setSeconds(0);
          toast.error("No audio captured.");
          return;
        }
        setState("processing");
        try {
          const base64 = await blobToBase64(blob);
          const text = await transcribe({ audioBase64: base64, format: formatRef.current });
          if (!text.trim()) {
            toast.error("Couldn't transcribe that recording.");
          } else {
            onTranscript(text);
            toast.success("Recording transcribed.");
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Transcription failed");
        } finally {
          setState("idle");
          setSeconds(0);
        }
      };
      recorderRef.current = rec;
      rec.start();
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  if (state === "recording") {
    return (
      <Button type="button" variant="destructive" onClick={stop} className="w-full">
        <Square /> Stop recording · {mm}:{ss}
      </Button>
    );
  }
  if (state === "processing") {
    return (
      <Button type="button" variant="secondary" disabled className="w-full">
        <Loader2 className="animate-spin" /> Transcribing…
      </Button>
    );
  }
  return (
    <Button type="button" variant="secondary" onClick={start} disabled={disabled} className="w-full">
      <Mic /> Record meeting audio
    </Button>
  );
}
