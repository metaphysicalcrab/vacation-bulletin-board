"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store-context";
import { createTrip, addMember } from "@/lib/store";
import { generateTripCode } from "@/lib/utils";
import { Anchor, Plus, Users } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { store, currentUser, setCurrentUser, setCurrentTripId } =
    useAppStore();
  const [view, setView] = useState<"home" | "create" | "join" | "name">(
    currentUser ? "home" : "name"
  );
  const [userName, setUserName] = useState("");
  const [tripName, setTripName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  function handleSetName(e: React.FormEvent) {
    e.preventDefault();
    const name = userName.trim();
    if (!name) return;
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36);
    setCurrentUser({ id, name });
    setView("home");
  }

  function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!tripName.trim() || !currentUser) return;
    const code = generateTripCode();
    const tripId = createTrip(store, tripName.trim(), code);
    addMember(store, tripId, currentUser.id, currentUser.name, "admin");
    setCurrentTripId(tripId);
    router.push(`/trip/${tripId}`);
  }

  function handleJoinTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim() || !currentUser) return;
    setError("");

    const trips = store.getTable("trips");
    const matchingTrip = Object.values(trips).find(
      (t) => (t.code as string).toUpperCase() === joinCode.trim().toUpperCase()
    );

    if (!matchingTrip) {
      setError("No trip found with that code. Check and try again.");
      return;
    }

    const tripId = matchingTrip.id as string;

    // Check if already a member
    const members = store.getTable("members");
    const alreadyMember = Object.values(members).some(
      (m) => m.tripId === tripId && m.userId === currentUser.id
    );
    if (!alreadyMember) {
      addMember(store, tripId, currentUser.id, currentUser.name, "member");
    }

    setCurrentTripId(tripId);
    router.push(`/trip/${tripId}`);
  }

  // Show existing trips
  const trips = store.getTable("trips");
  const tripList = Object.values(trips);

  if (view === "name") {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Anchor className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Voyage Board</h1>
            <p className="mt-1 text-sm text-foreground-secondary">
              Group chat for vacations & cruises
            </p>
          </div>
          <form onSubmit={handleSetName} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                What&apos;s your name?
              </label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                maxLength={30}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!userName.trim()}>
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center p-6">
      <div className="w-full max-w-sm space-y-6 pt-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Anchor className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Voyage Board</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Hey {currentUser?.name}!
          </p>
        </div>

        {view === "home" && (
          <div className="space-y-3">
            <Button
              onClick={() => setView("create")}
              className="w-full gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Create a Trip
            </Button>
            <Button
              onClick={() => setView("join")}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Users className="h-5 w-5" />
              Join a Trip
            </Button>

            {tripList.length > 0 && (
              <div className="pt-4">
                <h2 className="mb-2 text-sm font-medium text-foreground-secondary">
                  Your Trips
                </h2>
                <div className="space-y-2">
                  {tripList.map((trip) => (
                    <button
                      key={trip.id as string}
                      onClick={() => {
                        setCurrentTripId(trip.id as string);
                        router.push(`/trip/${trip.id}`);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-hover active:bg-surface-active"
                    >
                      <div>
                        <div className="font-medium">{trip.name as string}</div>
                        <div className="text-xs text-foreground-tertiary">
                          Code: {trip.code as string}
                        </div>
                      </div>
                      <span className="text-foreground-tertiary">&rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setCurrentUser(null);
                setView("name");
              }}
              className="w-full pt-2 text-center text-xs text-foreground-tertiary hover:text-foreground-secondary"
            >
              Switch user
            </button>
          </div>
        )}

        {view === "create" && (
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Trip Name
              </label>
              <Input
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder='e.g. "Caribbean Cruise 2026"'
                autoFocus
                maxLength={50}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setView("home")}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={!tripName.trim()}>
                Create Trip
              </Button>
            </div>
          </form>
        )}

        {view === "join" && (
          <form onSubmit={handleJoinTrip} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Trip Code
              </label>
              <Input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="Enter 6-character code"
                autoFocus
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              {error && (
                <p className="mt-1 text-sm text-destructive">{error}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setView("home")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={joinCode.trim().length < 6}
              >
                Join Trip
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
