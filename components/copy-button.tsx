"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Modern API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for non-secure contexts (HTTP)
        const textArea = document.createElement("textarea");
        textArea.value = value;
        
        // Ensure textarea is not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) throw new Error("Fallback copy failed");
      }

      setCopied(true);
      toast.success("Account number copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={cn(
        "p-1.5 rounded-xl hover:bg-accent transition-all text-muted-foreground hover:text-foreground active:scale-90 flex items-center justify-center border border-transparent hover:border-border/50 bg-background/50",
        className
      )}
      title="Copy Account Number"
    >
      {copied ? (
        <IconCheck className="h-4 w-4 text-green-500 animate-in zoom-in duration-300" />
      ) : (
        <IconCopy className="h-4 w-4" />
      )}
    </button>
  );
}
