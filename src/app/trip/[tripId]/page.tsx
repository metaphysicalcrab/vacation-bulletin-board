"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useTableRows } from "@/lib/store-context";
import { addMessage, togglePin } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import { Send, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useTableRows("messages", "tripId", tripId);
  const sorted = [...messages].sort(
    (a, b) => (a.timestamp as number) - (b.timestamp as number)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sorted.length]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    addMessage(store, tripId, currentUser.id, currentUser.name, text.trim());
    setText("");
    inputRef.current?.focus();
  }

  function handlePin(messageId: string) {
    togglePin(store, messageId);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {sorted.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-foreground-tertiary">
            <div>
              <p className="mb-1">No messages yet</p>
              <p>Start the conversation!</p>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {sorted.map((msg) => {
            const isOwn = msg.authorId === currentUser?.id;
            return (
              <div
                key={msg.id as string}
                className={cn(
                  "flex flex-col",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                {!isOwn && (
                  <span className="mb-0.5 px-1 text-xs font-medium text-foreground-secondary">
                    {msg.authorName as string}
                  </span>
                )}
                <div className="group flex items-end gap-1">
                  {isOwn && (
                    <button
                      onClick={() => handlePin(msg.id as string)}
                      className="mb-1 opacity-0 transition-opacity group-hover:opacity-100"
                      title={msg.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin
                        className={cn(
                          "h-3.5 w-3.5",
                          msg.pinned ? "text-pinned-icon" : "text-pinned-icon-inactive"
                        )}
                      />
                    </button>
                  )}
                  <div
                    className={cn(
                      "max-w-[75vw] rounded-2xl px-4 py-2 text-sm",
                      isOwn
                        ? "rounded-br-md bg-chat-own text-chat-own-text"
                        : "rounded-bl-md bg-chat-other text-chat-other-text",
                      (msg.pinned as number) === 1 && "ring-2 ring-pinned-ring"
                    )}
                  >
                    {msg.text as string}
                  </div>
                  {!isOwn && (
                    <button
                      onClick={() => handlePin(msg.id as string)}
                      className="mb-1 opacity-0 transition-opacity group-hover:opacity-100"
                      title={msg.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin
                        className={cn(
                          "h-3.5 w-3.5",
                          msg.pinned ? "text-pinned-icon" : "text-pinned-icon-inactive"
                        )}
                      />
                    </button>
                  )}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-foreground-tertiary">
                  {formatTime(msg.timestamp as number)}
                </span>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border-subtle bg-surface px-4 py-3"
      >
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
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
