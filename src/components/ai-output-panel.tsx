import { Copy, Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  loading?: boolean;
  downloadFilename?: string;
  placeholder?: string;
  rows?: number;
};

export function AIOutputPanel({
  value,
  onChange,
  onRegenerate,
  loading,
  downloadFilename = "output.txt",
  placeholder = "AI output will appear here…",
  rows = 14,
}: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  function handleChange(next: string) {
    setLocal(next);
    onChange(next);
  }

  async function copy() {
    if (!local) return;
    await navigator.clipboard.writeText(local);
    toast.success("Copied to clipboard");
  }

  function download() {
    if (!local) return;
    const blob = new Blob([local], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm leading-relaxed"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copy} disabled={!local}>
          <Copy /> Copy
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={download} disabled={!local}>
          <Download /> Download
        </Button>
        {onRegenerate && (
          <Button type="button" variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} /> Regenerate
          </Button>
        )}
      </div>
    </div>
  );
}
