"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore, usePolls, usePollVotes } from "@/lib/store-context";
import { addPoll, votePoll, closePoll, reopenPoll, deletePoll, isAdmin } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, X, BarChart3 } from "lucide-react";
import { PollForm } from "@/components/polls/poll-form";
import { PollCard } from "@/components/polls/poll-card";

export default function PollsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);

  const polls = usePolls(tripId);
  const allVotes = usePollVotes();
  const sortedPolls = [...polls].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  const userIsAdmin = currentUser ? isAdmin(store, tripId, currentUser.id) : false;

  function handleCreatePoll(question: string, options: string[]) {
    if (!currentUser) return;
    addPoll(store, tripId, currentUser.id, currentUser.name, question, options);
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
        {showCreate && <PollForm onSubmit={handleCreatePoll} />}

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
            const pollVotes = allVotes.filter((v) => v.pollId === poll.id);
            const isOwn = poll.authorId === currentUser?.id;

            return (
              <PollCard
                key={poll.id}
                poll={poll}
                pollVotes={pollVotes}
                tripId={tripId}
                currentUserId={currentUser?.id}
                canManage={isOwn || userIsAdmin}
                onVote={handleVote}
                onToggleClose={handleToggleClose}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
