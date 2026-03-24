"use client";

import { useParams } from "next/navigation";
import { useAppStore, useTableRows } from "@/lib/store-context";
import { togglePin } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import { Pin, PinOff, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function BoardPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store } = useAppStore();

  const messages = useTableRows("messages", "tripId", tripId);
  const pinned = messages
    .filter((m) => m.pinned === 1)
    .sort((a, b) => (b.timestamp as number) - (a.timestamp as number));

  function handleUnpin(messageId: string) {
    togglePin(store, messageId);
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="p-4">
        <h2 className="mb-1 text-lg font-semibold">Bulletin Board</h2>
        <p className="mb-4 text-sm text-foreground-secondary">
          Pinned messages and announcements
        </p>

        {pinned.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-foreground-tertiary">
            <Pin className="mb-3 h-8 w-8" />
            <p className="mb-1">No pinned messages yet</p>
            <p>
              Pin important messages from{" "}
              <Link
                href={`/trip/${tripId}`}
                className="text-accent hover:underline"
              >
                chat
              </Link>{" "}
              to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pinned.map((msg) => (
              <div
                key={msg.id as string}
                className="rounded-xl border border-border-accent bg-surface p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {msg.authorName as string}
                    </span>
                    <span className="ml-2 text-xs text-foreground-tertiary">
                      {formatTime(msg.timestamp as number)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnpin(msg.id as string)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-tertiary transition-colors hover:bg-surface-hover hover:text-foreground-secondary"
                  >
                    <PinOff className="h-3.5 w-3.5" />
                    Unpin
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {msg.text as string}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {pinned.length > 0 && (
        <div className="mt-auto border-t border-border-subtle p-4 text-center">
          <Link
            href={`/trip/${tripId}`}
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            Go to chat to pin more messages
          </Link>
        </div>
      )}
    </div>
  );
}
