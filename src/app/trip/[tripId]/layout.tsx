"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useAppStore, useRow } from "@/lib/store-context";
import { useEffect } from "react";
import {
  MessageCircle,
  Megaphone,
  BarChart3,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "", icon: MessageCircle, label: "Chat" },
  { href: "/board", icon: Megaphone, label: "Board" },
  { href: "/polls", icon: BarChart3, label: "Polls" },
  { href: "/itinerary", icon: Calendar, label: "Itinerary" },
];

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const tripId = params.tripId as string;
  const { setCurrentTripId } = useAppStore();
  const trip = useRow("trips", tripId);

  useEffect(() => {
    setCurrentTripId(tripId);
  }, [tripId, setCurrentTripId]);

  const tripName = (trip.name as string) || "Trip";
  const tripCode = (trip.code as string) || "";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">{tripName}</h1>
          <p className="text-xs text-foreground-tertiary">Code: {tripCode}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Bottom Navigation */}
      <nav className="flex border-t border-border-subtle bg-surface pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const href = `/trip/${tripId}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === `/trip/${tripId}`
              : pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-accent"
                  : "text-foreground-tertiary hover:text-foreground-secondary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
