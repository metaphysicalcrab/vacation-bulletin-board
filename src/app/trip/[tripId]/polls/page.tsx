"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useTableRows } from "@/lib/store-context";
import { addPoll, votePoll, closePoll, reopenPoll, deletePoll, isAdmin } from "@/lib/store";
import { formatTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, BarChart3, Check, Lock, Unlock, Trash2 } from "lucide-react";
import { AuthorName } from "@/components/author-name";

export default function PollsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const polls = useTableRows("polls", "tripId", tripId);
  const allVotes = useTableRows("pollVotes");
  const sortedPolls = [...polls].sort(
    (a, b) => (b.createdAt as number) - (a.createdAt as number)
  );

  const userIsAdmin = currentUser ? isAdmin(store, tripId, currentUser.id) : false;

  function handleAddOption() {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }

  function handleRemoveOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function handleCreatePoll(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !currentUser) return;
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return;

    addPoll(
      store,
      tripId,
      currentUser.id,
      currentUser.name,
      question.trim(),
      validOptions
    );
    setQuestion("");
    setOptions(["", ""]);
    setShowCreate(false);
  }

  function handleVote(pollId: string, optionIndex: number) {
    if (!currentUser) return;
    votePoll(store, pollId, currentUser.id, currentUser.name, optionIndex);
  }

  function handleToggleClose(pollId: string, isClosed: boolean) {
    if (isClosed) {
      reopenPoll(store, pollId);
    } else {
      closePoll(store, pollId);
    }
  }

  function handleDelete(pollId: string) {
    deletePoll(store, pollId);
    setConfirmDeleteId(null);
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Polls</h2>
            <p className="text-sm text-foreground-secondary">Vote on activities & plans</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(!showCreate)}
            className="gap-1"
          >
            {showCreate ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {showCreate ? "Cancel" : "New Poll"}
          </Button>
        </div>

        {/* Create Poll Form */}
        {showCreate && (
          <form
            onSubmit={handleCreatePoll}
            className="mb-6 rounded-xl border border-border bg-surface p-4"
          >
            <div className="mb-3">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you want to ask?"
                autoFocus
                maxLength={200}
              />
            </div>
            <div className="mb-3 space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${i + 1}`}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="text-foreground-tertiary hover:text-foreground-secondary"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-sm text-accent hover:underline"
                >
                  + Add option
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={
                  !question.trim() ||
                  options.filter((o) => o.trim()).length < 2
                }
              >
                Create Poll
              </Button>
            </div>
          </form>
        )}

        {/* Polls List */}
        {sortedPolls.length === 0 && !showCreate && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
              <BarChart3 className="h-7 w-7 text-accent" />
            </div>
            <h3 className="mb-1 font-medium text-foreground-secondary">
              No polls yet
            </h3>
            <p className="mb-4 max-w-xs text-sm text-foreground-tertiary">
              Can&apos;t decide? Create a poll and let the group vote.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm font-medium text-accent hover:underline"
            >
              + Create your first poll
            </button>
          </div>
        )}

        <div className="space-y-4">
          {sortedPolls.map((poll) => {
            const pollOptions: string[] = JSON.parse(
              poll.options as string
            );
            const pollVotes = allVotes.filter(
              (v) => v.pollId === poll.id
            );
            const totalVotes = pollVotes.length;
            const myVote = pollVotes.find(
              (v) => v.memberId === currentUser?.id
            );
            const isClosed = (poll.closed as number) === 1;
            const isOwn = poll.authorId === currentUser?.id;
            const canManage = isOwn || userIsAdmin;
            const isConfirmingDelete = confirmDeleteId === poll.id;

            return (
              <div
                key={poll.id as string}
                className={cn(
                  "group rounded-xl border bg-surface p-4",
                  isClosed ? "border-border-subtle" : "border-border"
                )}
              >
                <div className="mb-1 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{poll.question as string}</h3>
                    {isClosed && (
                      <span className="rounded-full bg-surface-active px-2 py-0.5 text-[10px] font-medium text-foreground-secondary">
                        Closed
                      </span>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleToggleClose(poll.id as string, isClosed)}
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
                        onClick={() => setConfirmDeleteId(poll.id as string)}
                        className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
                        aria-label="Delete poll"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {isConfirmingDelete && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-foreground-secondary">Delete this poll and all votes?</span>
                    <button
                      onClick={() => handleDelete(poll.id as string)}
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
                )}

                <p className="mb-3 text-xs text-foreground-tertiary">
                  by{" "}
                  <AuthorName
                    tripId={tripId}
                    authorId={poll.authorId as string}
                    fallbackName={poll.authorName as string}
                  />
                  {" "}&middot;{" "}
                  {formatTime(poll.createdAt as number)}
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
                    const isMyVote =
                      myVote && (myVote.optionIndex as number) === i;

                    return (
                      <button
                        key={i}
                        onClick={() =>
                          !isClosed && handleVote(poll.id as string, i)
                        }
                        disabled={isClosed}
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
          })}
        </div>
      </div>
    </div>
  );
}
