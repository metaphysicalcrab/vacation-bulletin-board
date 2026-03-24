"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ItineraryEvent } from "@/lib/store";

export function EventForm({
  onSubmit,
  initialEvent,
  isEditing = false,
}: {
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    startTime: number;
    endTime: number;
  }) => void;
  initialEvent?: ItineraryEvent;
  isEditing?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description);
      setLocation(initialEvent.location);
      const start = new Date(initialEvent.startTime);
      const end = new Date(initialEvent.endTime);
      setStartDate(start.toISOString().split("T")[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split("T")[0]);
      setEndTime(end.toTimeString().slice(0, 5));
    }
  }, [initialEvent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime) return;

    const start = new Date(`${startDate}T${startTime}`).getTime();
    const end =
      endDate && endTime
        ? new Date(`${endDate}T${endTime}`).getTime()
        : start + 3600000;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startTime: start,
      endTime: end,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
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
        {isEditing ? "Save Changes" : "Add to Itinerary"}
      </Button>
    </form>
  );
}
