"use client";

import { useRef, useEffect, useState } from "react";
import { Pin, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { AuthorName } from "@/components/author-name";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Message } from "@/lib/store";

export function MessageItem({
  msg,
  tripId,
  isOwn,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  msg: Message;
  tripId: string;
  isOwn: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (messageId: string, text: string) => void;
  onDelete: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  function handleStartEdit() {
    setIsEditing(true);
    setEditText(msg.text);
  }

  function handleSaveEdit() {
    if (editText.trim()) {
      onEdit(msg.id, editText.trim());
    }
    setIsEditing(false);
    setEditText("");
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditText("");
  }

  function handleConfirmDelete() {
    onDelete(msg.id);
    setIsConfirmingDelete(false);
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}
    >
      {!isOwn && (
        <AuthorName
          tripId={tripId}
          authorId={msg.authorId}
          fallbackName={msg.authorName}
          className="mb-0.5 px-1 text-xs font-medium text-foreground-secondary"
        />
      )}
      <div className="group relative flex items-end gap-1">
        {/* Action buttons on hover — left side for own messages */}
        {isOwn && !isEditing && (
          <div className="mb-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {canEdit && (
              <button
                onClick={handleStartEdit}
                className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                aria-label="Edit message"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
                aria-label="Delete message"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={() => onTogglePin(msg.id)}
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
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="rounded-2xl border border-accent bg-surface-inset px-4 py-2 text-sm text-foreground outline-none"
            />
            <button
              onClick={handleSaveEdit}
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
          <ConfirmDialog
            message="Delete?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setIsConfirmingDelete(false)}
            className="rounded-2xl border border-destructive bg-surface px-4 py-2"
          />
        ) : (
          <div
            className={cn(
              "max-w-[75vw] rounded-2xl px-4 py-2 text-sm",
              isOwn
                ? "rounded-br-md bg-chat-own text-chat-own-text"
                : "rounded-bl-md bg-chat-other text-chat-other-text",
              msg.pinned === 1 && "ring-2 ring-pinned-ring"
            )}
          >
            {msg.text}
            {msg.editedAt > 0 && (
              <span className="ml-1 text-[10px] opacity-60">(edited)</span>
            )}
          </div>
        )}

        {/* Action buttons — right side for others' messages */}
        {!isOwn && !isEditing && (
          <div className="mb-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onTogglePin(msg.id)}
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
                onClick={() => setIsConfirmingDelete(true)}
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
        {formatTime(msg.timestamp)}
      </span>
    </div>
  );
}
