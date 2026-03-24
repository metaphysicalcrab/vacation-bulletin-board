"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useTableRows } from "@/lib/store-context";
import { addPoll, votePoll } from "@/lib/store";
import { formatTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, BarChart3, Check } from "lucide-react";

export default function PollsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const polls = useTableRows("polls", "tripId", tripId);
  const allVotes = useTableRows("pollVotes");
  const sortedPolls = [...polls].sort(
    (a, b) => (b.createdAt as number) - (a.createdAt as number)
  );

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
          <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-foreground-tertiary">
            <BarChart3 className="mb-3 h-8 w-8" />
            <p className="mb-1">No polls yet</p>
            <p>Create one to get the group voting!</p>
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

            return (
              <div
                key={poll.id as string}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="font-medium">{poll.question as string}</h3>
                </div>
                <p className="mb-3 text-xs text-foreground-tertiary">
                  by {poll.authorName as string} &middot;{" "}
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
                          handleVote(poll.id as string, i)
                        }
                        className={cn(
                          "relative flex w-full items-center justify-between overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          isMyVote
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
