"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore, useTableRows } from "@/lib/store-context";
import { addEvent } from "@/lib/store";
import { formatEventTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Calendar, MapPin, Clock } from "lucide-react";

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

  const events = useTableRows("events", "tripId", tripId);
  const sortedEvents = [...events].sort(
    (a, b) => (a.startTime as number) - (b.startTime as number)
  );

  // Group events by day
  const groupedEvents: Record<string, typeof sortedEvents> = {};
  for (const event of sortedEvents) {
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

    setTitle("");
    setDescription("");
    setLocation("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setShowCreate(false);
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
            {showCreate ? "Cancel" : "Add Event"}
          </Button>
        </div>

        {/* Create Event Form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
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
              Add to Itinerary
            </Button>
          </form>
        )}

        {/* Events Timeline */}
        {sortedEvents.length === 0 && !showCreate && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-foreground-tertiary">
            <Calendar className="mb-3 h-8 w-8" />
            <p className="mb-1">No events scheduled</p>
            <p>Add events to plan your trip!</p>
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
                  return (
                    <div
                      key={event.id as string}
                      className={cn(
                        "rounded-xl border bg-surface p-4",
                        isPast
                          ? "border-border-subtle opacity-60"
                          : "border-border"
                      )}
                    >
                      <h4 className="font-medium">{event.title as string}</h4>
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
                        Added by {event.authorName as string}
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
