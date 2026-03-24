"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useAppStore, useRow, useMessages, usePolls, useEvents } from "@/lib/store-context";
import { useEffect, useState, useMemo } from "react";
import { updateReadMarker, getReadMarkerTimestamp } from "@/lib/store";
import {
  MessageCircle,
  Megaphone,
  BarChart3,
  Calendar,
  ArrowLeft,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberList } from "@/components/member-list";

const navItems = [
  { href: "", icon: MessageCircle, label: "Chat", tab: "chat" },
  { href: "/board", icon: Megaphone, label: "Board", tab: "board" },
  { href: "/polls", icon: BarChart3, label: "Polls", tab: "polls" },
  { href: "/itinerary", icon: Calendar, label: "Itinerary", tab: "itinerary" },
];

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const tripId = params.tripId as string;
  const { store, currentUser, setCurrentTripId, connectionStatus } = useAppStore();
  const trip = useRow("trips", tripId);
  const [showMembers, setShowMembers] = useState(false);

  // Data for unread indicators
  const messages = useMessages(tripId);
  const polls = usePolls(tripId);
  const events = useEvents(tripId);

  useEffect(() => {
    setCurrentTripId(tripId);
  }, [tripId, setCurrentTripId]);

  // Update read marker for current tab
  const activeTab = useMemo(() => {
    for (const item of navItems) {
      const href = `/trip/${tripId}${item.href}`;
      if (item.href === "" ? pathname === `/trip/${tripId}` : pathname.startsWith(href)) {
        return item.tab;
      }
    }
    return "chat";
  }, [pathname, tripId]);

  useEffect(() => {
    if (currentUser) {
      updateReadMarker(store, tripId, currentUser.id, activeTab);
    }
  }, [store, tripId, currentUser, activeTab]);

  // Calculate unread status for each tab
  const unreadTabs = useMemo(() => {
    if (!currentUser) return new Set<string>();
    const unread = new Set<string>();

    const chatMarker = getReadMarkerTimestamp(store, tripId, currentUser.id, "chat");
    const hasUnreadChat = messages.some(
      (m) => m.timestamp > chatMarker && m.authorId !== currentUser.id
    );
    if (hasUnreadChat) unread.add("chat");

    const boardMarker = getReadMarkerTimestamp(store, tripId, currentUser.id, "board");
    const pinnedMessages = messages.filter((m) => m.pinned === 1);
    const hasUnreadBoard = pinnedMessages.some(
      (m) => m.timestamp > boardMarker
    );
    if (hasUnreadBoard) unread.add("board");

    const pollsMarker = getReadMarkerTimestamp(store, tripId, currentUser.id, "polls");
    const hasUnreadPolls = polls.some(
      (p) => p.createdAt > pollsMarker && p.authorId !== currentUser.id
    );
    if (hasUnreadPolls) unread.add("polls");

    const itineraryMarker = getReadMarkerTimestamp(store, tripId, currentUser.id, "itinerary");
    const hasUnreadItinerary = events.some(
      (e) => e.createdAt > itineraryMarker && e.authorId !== currentUser.id
    );
    if (hasUnreadItinerary) unread.add("itinerary");

    return unread;
  }, [store, tripId, currentUser, messages, polls, events]);

  const tripName = (trip.name as string) || "Trip";
  const tripCode = (trip.code as string) || ""; // useRow returns Record<string, unknown>

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-hover"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">{tripName}</h1>
          <p className="flex items-center gap-1.5 text-xs text-foreground-tertiary">
            Code: {tripCode}
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                connectionStatus === "connected"
                  ? "bg-success"
                  : connectionStatus === "connecting"
                  ? "bg-accent animate-pulse"
                  : "bg-foreground-tertiary"
              )}
              title={
                connectionStatus === "connected"
                  ? "Connected — syncing live"
                  : connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Offline — local only"
              }
            />
          </p>
        </div>
        <button
          onClick={() => setShowMembers(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-hover"
          aria-label="View members"
        >
          <Users className="h-5 w-5" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Bottom Navigation */}
      <nav
        className="flex border-t border-border-subtle bg-surface pb-[env(safe-area-inset-bottom)]"
        role="tablist"
      >
        {navItems.map((item) => {
          const href = `/trip/${tripId}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === `/trip/${tripId}`
              : pathname.startsWith(href);
          const hasUnread = !isActive && unreadTabs.has(item.tab);

          return (
            <Link
              key={item.href}
              href={href}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-accent"
                  : "text-foreground-tertiary hover:text-foreground-secondary"
              )}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {hasUnread && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent" />
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Member List Slide-out */}
      {showMembers && (
        <MemberList tripId={tripId} onClose={() => setShowMembers(false)} />
      )}
    </div>
  );
}
