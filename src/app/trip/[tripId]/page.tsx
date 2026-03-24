"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useTableRows } from "@/lib/store-context";
import {
  addMessage,
  togglePin,
  updateMessage,
  deleteMessage,
  isAdmin,
} from "@/lib/store";
import { formatTime } from "@/lib/utils";
import { Send, Pin, Pencil, Trash2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthorName } from "@/components/author-name";

export default function ChatPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const messages = useTableRows("messages", "tripId", tripId);
  const sorted = [...messages].sort(
    (a, b) => (a.timestamp as number) - (b.timestamp as number)
  );

  const filtered = searchQuery
    ? sorted.filter((msg) =>
        (msg.text as string).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sorted;

  const userIsAdmin = currentUser
    ? isAdmin(store, tripId, currentUser.id)
    : false;

  useEffect(() => {
    if (!searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [sorted.length, searchQuery]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    addMessage(store, tripId, currentUser.id, currentUser.name, text.trim());
    setText("");
    inputRef.current?.focus();
  }

  function handleStartEdit(messageId: string, currentText: string) {
    setEditingId(messageId);
    setEditText(currentText);
    setActiveMenuId(null);
  }

  function handleSaveEdit(messageId: string) {
    if (editText.trim()) {
      updateMessage(store, messageId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function handleDelete(messageId: string) {
    deleteMessage(store, messageId);
    setConfirmDeleteId(null);
    setActiveMenuId(null);
  }

  function handlePin(messageId: string) {
    togglePin(store, messageId);
    setActiveMenuId(null);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 border-b border-border-subtle bg-surface px-4 py-2">
          <Search className="h-4 w-4 text-foreground-tertiary" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
            className="text-foreground-tertiary hover:text-foreground-secondary"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {filtered.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              {searchQuery ? (
                <p className="text-sm text-foreground-tertiary">
                  No messages match &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
                    <Send className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="mb-1 font-medium text-foreground-secondary">
                    Start the conversation
                  </h3>
                  <p className="max-w-xs text-sm text-foreground-tertiary">
                    Share ideas, links, and plans with your group.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((msg) => {
            const isOwn = msg.authorId === currentUser?.id;
            const canDelete = isOwn || userIsAdmin;
            const canEdit = isOwn;
            const isEditing = editingId === msg.id;
            const isConfirmingDelete = confirmDeleteId === msg.id;
            const showMenu = activeMenuId === msg.id;

            return (
              <div
                key={msg.id as string}
                className={cn(
                  "flex flex-col",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                {!isOwn && (
                  <AuthorName
                    tripId={tripId}
                    authorId={msg.authorId as string}
                    fallbackName={msg.authorName as string}
                    className="mb-0.5 px-1 text-xs font-medium text-foreground-secondary"
                  />
                )}
                <div className="group relative flex items-end gap-1">
                  {/* Action buttons on hover — left side for own messages */}
                  {isOwn && !isEditing && (
                    <div className="mb-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {canEdit && (
                        <button
                          onClick={() => handleStartEdit(msg.id as string, msg.text as string)}
                          className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                          aria-label="Edit message"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setConfirmDeleteId(msg.id as string)}
                          className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
                          aria-label="Delete message"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handlePin(msg.id as string)}
                        className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                        aria-label={msg.pinned ? "Unpin" : "Pin"}
                      >
                        <Pin
                          className={cn(
                            "h-3 w-3",
                            msg.pinned ? "text-pinned-icon" : ""
                          )}
                        />
                      </button>
                    </div>
                  )}

                  {/* Message bubble */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={editInputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(msg.id as string);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="rounded-2xl border border-accent bg-surface-inset px-4 py-2 text-sm text-foreground outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(msg.id as string)}
                        className="text-xs text-accent hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs text-foreground-tertiary hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : isConfirmingDelete ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-destructive bg-surface px-4 py-2">
                      <span className="text-sm text-foreground-secondary">Delete?</span>
                      <button
                        onClick={() => handleDelete(msg.id as string)}
                        className="text-xs font-medium text-destructive hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-foreground-tertiary hover:underline"
                      >
                        No
                      </button>
                    </div>
                  ) : (
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
                      {(msg.editedAt as number) > 0 && (
                        <span className="ml-1 text-[10px] opacity-60">(edited)</span>
                      )}
                    </div>
                  )}

                  {/* Action buttons — right side for others' messages */}
                  {!isOwn && !isEditing && (
                    <div className="mb-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handlePin(msg.id as string)}
                        className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                        aria-label={msg.pinned ? "Unpin" : "Pin"}
                      >
                        <Pin
                          className={cn(
                            "h-3 w-3",
                            msg.pinned ? "text-pinned-icon" : ""
                          )}
                        />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => setConfirmDeleteId(msg.id as string)}
                          className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
                          aria-label="Delete message"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
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
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
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
    </div>
  );
}
