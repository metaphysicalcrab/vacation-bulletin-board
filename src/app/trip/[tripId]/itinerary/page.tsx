"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useTableRows } from "@/lib/store-context";
import { addEvent, updateEvent, deleteEvent, isAdmin } from "@/lib/store";
import { formatEventTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Calendar, MapPin, Clock, Pencil, Trash2, Search } from "lucide-react";
import { AuthorName } from "@/components/author-name";

export default function ItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const events = useTableRows("events", "tripId", tripId);
  const sortedEvents = [...events].sort(
    (a, b) => (a.startTime as number) - (b.startTime as number)
  );

  const filteredEvents = searchQuery
    ? sortedEvents.filter(
        (e) =>
          (e.title as string).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.description as string).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.location as string).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedEvents;

  const userIsAdmin = currentUser ? isAdmin(store, tripId, currentUser.id) : false;

  // Group events by day
  const groupedEvents: Record<string, typeof filteredEvents> = {};
  for (const event of filteredEvents) {
    const day = new Date(event.startTime as number).toLocaleDateString(
      undefined,
      { weekday: "long", month: "long", day: "numeric" }
    );
    if (!groupedEvents[day]) groupedEvents[day] = [];
    groupedEvents[day].push(event);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime || !currentUser) return;

    const start = new Date(`${startDate}T${startTime}`).getTime();
    const end =
      endDate && endTime
        ? new Date(`${endDate}T${endTime}`).getTime()
        : start + 3600000; // default 1 hour

    addEvent(
      store,
      tripId,
      currentUser.id,
      currentUser.name,
      title.trim(),
      description.trim(),
      start,
      end,
      location.trim()
    );

    resetForm();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setLocation("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setShowCreate(false);
    setEditingId(null);
  }

  function handleStartEdit(event: Record<string, unknown>) {
    setEditingId(event.id as string);
    setTitle(event.title as string);
    setDescription(event.description as string);
    setLocation(event.location as string);
    const start = new Date(event.startTime as number);
    const end = new Date(event.endTime as number);
    setStartDate(start.toISOString().split("T")[0]);
    setStartTime(start.toTimeString().slice(0, 5));
    setEndDate(end.toISOString().split("T")[0]);
    setEndTime(end.toTimeString().slice(0, 5));
    setShowCreate(true);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !title.trim() || !startDate || !startTime) return;

    const start = new Date(`${startDate}T${startTime}`).getTime();
    const end =
      endDate && endTime
        ? new Date(`${endDate}T${endTime}`).getTime()
        : start + 3600000;

    updateEvent(store, editingId, {
      title: title.trim(),
      description: description.trim(),
      startTime: start,
      endTime: end,
      location: location.trim(),
    });

    resetForm();
  }

  function handleDelete(eventId: string) {
    deleteEvent(store, eventId);
    setConfirmDeleteId(null);
  }

  const now = Date.now();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Itinerary</h2>
            <p className="text-sm text-foreground-secondary">Shared trip schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
              className="rounded-lg p-2 text-foreground-tertiary transition-colors hover:bg-surface-hover hover:text-foreground-secondary"
              aria-label="Search events"
            >
              <Search className="h-4 w-4" />
            </button>
            <Button
              size="sm"
              onClick={() => {
                if (showCreate) resetForm();
                else setShowCreate(true);
              }}
              className="gap-1"
            >
              {showCreate ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {showCreate ? "Cancel" : "Add Event"}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface-inset px-3 py-2">
            <Search className="h-4 w-4 text-foreground-tertiary" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-foreground-tertiary hover:text-foreground-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Create/Edit Event Form */}
        {showCreate && (
          <form
            onSubmit={editingId ? handleSaveEdit : handleCreate}
            className="mb-6 space-y-3 rounded-xl border border-border bg-surface p-4"
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
              maxLength={100}
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              maxLength={500}
            />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              maxLength={100}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-foreground-secondary">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!endDate) setEndDate(e.target.value);
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-foreground-secondary">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-foreground-secondary">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-foreground-secondary">
                  End Time
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || !startDate || !startTime}
              className="w-full"
            >
              {editingId ? "Save Changes" : "Add to Itinerary"}
            </Button>
          </form>
        )}

        {/* Events Timeline */}
        {filteredEvents.length === 0 && !showCreate && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {searchQuery ? (
              <p className="text-sm text-foreground-tertiary">
                No events match &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle">
                  <Calendar className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-1 font-medium text-foreground-secondary">
                  No events scheduled
                </h3>
                <p className="mb-4 max-w-xs text-sm text-foreground-tertiary">
                  Plan your days — add activities, restaurants, and excursions.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  + Add your first event
                </button>
              </>
            )}
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([day, dayEvents]) => (
            <div key={day}>
              <h3 className="mb-2 text-sm font-semibold text-foreground-secondary">
                {day}
              </h3>
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const isPast = (event.endTime as number) < now;
                  const isOwn = event.authorId === currentUser?.id;
                  const canModify = isOwn || userIsAdmin;
                  const isConfirmingDelete = confirmDeleteId === event.id;

                  return (
                    <div
                      key={event.id as string}
                      className={cn(
                        "group rounded-xl border bg-surface p-4",
                        isPast
                          ? "border-border-subtle opacity-60"
                          : "border-border"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{event.title as string}</h4>
                        {canModify && !isConfirmingDelete && (
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {isOwn && (
                              <button
                                onClick={() => handleStartEdit(event)}
                                className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-secondary"
                                aria-label="Edit event"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmDeleteId(event.id as string)}
                              className="rounded p-1 text-foreground-tertiary hover:bg-surface-hover hover:text-destructive"
                              aria-label="Delete event"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        {isConfirmingDelete && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-foreground-secondary">Delete?</span>
                            <button
                              onClick={() => handleDelete(event.id as string)}
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
                      </div>
                      {(event.description as string) ? (
                        <p className="mt-1 text-sm text-foreground-secondary">
                          {event.description as string}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatEventTime(event.startTime as number)}
                          {" - "}
                          {new Date(
                            event.endTime as number
                          ).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        {(event.location as string) ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location as string}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[10px] text-foreground-tertiary">
                        Added by{" "}
                        <AuthorName
                          tripId={tripId}
                          authorId={event.authorId as string}
                          fallbackName={event.authorName as string}
                        />
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
