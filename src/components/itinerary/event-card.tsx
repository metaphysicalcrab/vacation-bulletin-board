"use client";

import { useState } from "react";
import { Pencil, Trash2, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEventTime } from "@/lib/utils";
import { AuthorName } from "@/components/author-name";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { ItineraryEvent } from "@/lib/store";

export function EventCard({
  event,
  tripId,
  isPast,
  isOwn,
  canModify,
  onEdit,
  onDelete,
}: {
  event: ItineraryEvent;
  tripId: string;
  isPast: boolean;
  isOwn: boolean;
  canModify: boolean;
  onEdit: (event: ItineraryEvent) => void;
  onDelete: (eventId: string) => void;
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <div
      className={cn(
        "group rounded-xl border bg-surface p-4",
        isPast
          ? "border-border-subtle opacity-60"
          : "border-border"
      )}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium">{event.title}</h4>
        {canModify && !isConfirmingDelete && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {isOwn && (
              <button
                onClick={() => onEdit(event)}
                className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                aria-label="Edit event"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
              aria-label="Delete event"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {isConfirmingDelete && (
          <ConfirmDialog
            message="Delete?"
            onConfirm={() => {
              onDelete(event.id);
              setIsConfirmingDelete(false);
            }}
            onCancel={() => setIsConfirmingDelete(false)}
          />
        )}
      </div>
      {event.description ? (
        <p className="mt-1 text-sm text-foreground-secondary">
          {event.description}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-foreground-secondary">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatEventTime(event.startTime)}
          {" - "}
          {new Date(event.endTime).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
        {event.location ? (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[10px] text-foreground-tertiary">
        Added by{" "}
        <AuthorName
          tripId={tripId}
          authorId={event.authorId}
          fallbackName={event.authorName}
        />
      </p>
    </div>
  );
}
