"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useEvents } from "@/lib/store-context";
import { addEvent, updateEvent, deleteEvent, isAdmin } from "@/lib/store";
import type { ItineraryEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, X, Calendar, Search } from "lucide-react";
import { EventForm } from "@/components/itinerary/event-form";
import { EventCard } from "@/components/itinerary/event-card";

export default function ItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { store, currentUser } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ItineraryEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const events = useEvents(tripId);
  const sortedEvents = [...events].sort(
    (a, b) => a.startTime - b.startTime
  );

  const filteredEvents = searchQuery
    ? sortedEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedEvents;

  const userIsAdmin = currentUser ? isAdmin(store, tripId, currentUser.id) : false;

  // Group events by day
  const groupedEvents: Record<string, ItineraryEvent[]> = {};
  for (const event of filteredEvents) {
    const day = new Date(event.startTime).toLocaleDateString(
      undefined,
      { weekday: "long", month: "long", day: "numeric" }
    );
    if (!groupedEvents[day]) groupedEvents[day] = [];
    groupedEvents[day].push(event);
  }

  function handleCreate(data: {
    title: string;
    description: string;
    location: string;
    startTime: number;
    endTime: number;
  }) {
    if (!currentUser) return;
    addEvent(
      store,
      tripId,
      currentUser.id,
      currentUser.name,
      data.title,
      data.description,
      data.startTime,
      data.endTime,
      data.location
    );
    setShowCreate(false);
    setEditingEvent(null);
  }

  function handleSaveEdit(data: {
    title: string;
    description: string;
    location: string;
    startTime: number;
    endTime: number;
  }) {
    if (!editingEvent) return;
    updateEvent(store, editingEvent.id, data);
    setShowCreate(false);
    setEditingEvent(null);
  }

  function handleStartEdit(event: ItineraryEvent) {
    setEditingEvent(event);
    setShowCreate(true);
  }

  function handleDelete(eventId: string) {
    deleteEvent(store, eventId);
  }

  function resetForm() {
    setShowCreate(false);
    setEditingEvent(null);
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
          <EventForm
            onSubmit={editingEvent ? handleSaveEdit : handleCreate}
            initialEvent={editingEvent ?? undefined}
            isEditing={!!editingEvent}
          />
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
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    tripId={tripId}
                    isPast={event.endTime < now}
                    isOwn={event.authorId === currentUser?.id}
                    canModify={event.authorId === currentUser?.id || userIsAdmin}
                    onEdit={handleStartEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
