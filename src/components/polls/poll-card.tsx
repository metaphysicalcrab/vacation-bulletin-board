"use client";

import { useState } from "react";
import { Lock, Unlock, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { AuthorName } from "@/components/author-name";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Poll, PollVote } from "@/lib/store";

export function PollCard({
  poll,
  pollVotes,
  tripId,
  currentUserId,
  canManage,
  onVote,
  onToggleClose,
  onDelete,
}: {
  poll: Poll;
  pollVotes: PollVote[];
  tripId: string;
  currentUserId?: string;
  canManage: boolean;
  onVote: (pollId: string, optionIndex: number) => void;
  onToggleClose: (pollId: string, isClosed: boolean) => void;
  onDelete: (pollId: string) => void;
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  let pollOptions: string[] = [];
  try {
    pollOptions = JSON.parse(poll.options);
  } catch {
    pollOptions = [];
  }

  const totalVotes = pollVotes.length;
  const myVote = pollVotes.find((v) => v.memberId === currentUserId);
  const isClosed = poll.closed === 1;

  return (
    <div
      className={cn(
        "group rounded-xl border bg-surface p-4",
        isClosed ? "border-border-subtle" : "border-border"
      )}
    >
      <div className="mb-1 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{poll.question}</h3>
          {isClosed && (
            <span className="rounded-full bg-surface-active px-2 py-0.5 text-[10px] font-medium text-foreground-secondary">
              Closed
            </span>
          )}
        </div>
        {canManage && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onToggleClose(poll.id, isClosed)}
              className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
              title={isClosed ? "Reopen poll" : "Close poll"}
              aria-label={isClosed ? "Reopen poll" : "Close poll"}
            >
              {isClosed ? (
                <Unlock className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
              aria-label="Delete poll"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {isConfirmingDelete && (
        <ConfirmDialog
          message="Delete this poll and all votes?"
          onConfirm={() => {
            onDelete(poll.id);
            setIsConfirmingDelete(false);
          }}
          onCancel={() => setIsConfirmingDelete(false)}
          className="mb-2"
        />
      )}

      <p className="mb-3 text-xs text-foreground-tertiary">
        by{" "}
        <AuthorName
          tripId={tripId}
          authorId={poll.authorId}
          fallbackName={poll.authorName}
        />
        {" "}&middot;{" "}
        {formatTime(poll.createdAt)}
      </p>

      <div className="space-y-2">
        {pollOptions.map((option, i) => {
          const optVotes = pollVotes.filter(
            (v) => v.optionIndex === i
          ).length;
          const pct =
            totalVotes > 0
              ? Math.round((optVotes / totalVotes) * 100)
              : 0;
          const isMyVote = myVote && myVote.optionIndex === i;

          return (
            <button
              key={i}
              onClick={() => !isClosed && onVote(poll.id, i)}
              disabled={isClosed}
              aria-label={`Vote for ${option}: ${optVotes} vote${optVotes !== 1 ? "s" : ""}, ${pct}%`}
              className={cn(
                "relative flex w-full items-center justify-between overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                isClosed
                  ? "cursor-default border-border-subtle"
                  : isMyVote
                  ? "border-accent bg-accent-subtle"
                  : "border-border hover:border-foreground-tertiary hover:bg-surface-hover"
              )}
            >
              {/* Progress bar */}
              <div
                className="absolute inset-0 bg-accent-subtle transition-all"
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex items-center gap-2">
                {isMyVote && (
                  <Check className="h-3.5 w-3.5 text-accent" />
                )}
                {option}
              </span>
              <span className="relative text-xs text-foreground-secondary">
                {optVotes} ({pct}%)
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-foreground-tertiary">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
