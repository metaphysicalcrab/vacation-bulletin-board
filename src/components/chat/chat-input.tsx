"use client";

import { useState, useRef } from "react";
import { Send, Search } from "lucide-react";

export function ChatInput({
  onSend,
  onToggleSearch,
}: {
  onSend: (text: string) => void;
  onToggleSearch: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-border-subtle bg-surface px-4 py-3"
    >
      <button
        type="button"
        onClick={onToggleSearch}
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-tertiary transition-colors hover:text-foreground-secondary"
        aria-label="Search messages"
      >
        <Search className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-full border border-border bg-surface-inset px-4 py-2 text-sm text-foreground placeholder:text-foreground-tertiary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        autoFocus
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-40"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
