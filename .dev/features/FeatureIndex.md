# Feature Index — Vacation Bulletin Board

> Master index of all documented features, systems, and utilities.
> Claude Code: Scan this index to find the right doc before modifying a feature, system, or utility.
> **Last updated:** 2026-03-24

## Features

> User-facing functionality — things a user directly interacts with.

| Name | One-liner | Location |
|------|-----------|----------|
| Trip Management | Create trips, join via code, list user's trips | `/src/app/page.tsx` |
| Chat | Send messages, pin/unpin, relative timestamps | `/src/app/trip/[tripId]/page.tsx`, `/src/components/chat/` |
| Bulletin Board | View-only gallery of pinned messages | `/src/app/trip/[tripId]/board/page.tsx` |
| Polls | Create polls with 2-6 options, vote, view results | `/src/app/trip/[tripId]/polls/page.tsx`, `/src/components/polls/` |
| Itinerary | Create events with date/time/location, grouped by day | `/src/app/trip/[tripId]/itinerary/page.tsx`, `/src/components/itinerary/` |

## Systems

> Runtime infrastructure that features depend on.

| Name | One-liner | Location |
|------|-----------|----------|
| TinyBase Store | Schema definition, table setup, helper mutation functions | `/src/lib/store.ts` |
| Store Context | React Context provider, localStorage persistence, reactive hooks | `/src/lib/store-context.tsx` |
| Theme System | CSS custom properties, semantic color tokens, Tailwind `@theme inline` | `/src/app/globals.css` |
| Trip Layout | Shared trip shell with header (name/code) and bottom tab navigation | `/src/app/trip/[tripId]/layout.tsx` |

## Utilities

> Shared tools, helpers, singletons — cross-cutting concerns used by multiple features/systems.

| Name | One-liner | Location |
|------|-----------|----------|
| `cn()` | Merges class names via clsx + tailwind-merge | `/src/lib/utils.ts` |
| `generateTripCode()` | Generates 6-char alphanumeric trip join code | `/src/lib/utils.ts` |
| `formatTime()` | Relative timestamp formatting ("5m ago", "2h ago") | `/src/lib/utils.ts` |
| `formatEventTime()` | Long date/time formatting for itinerary events | `/src/lib/utils.ts` |
| Button / Input / Textarea | Styled UI primitives with CVA variants | `/src/components/ui/` |
| ConfirmDialog | Reusable inline delete/remove confirmation | `/src/components/confirm-dialog.tsx` |
| SearchBar | Reusable search input with close button | `/src/components/search-bar.tsx` |
| Typed Table Hooks | `useMessages`, `usePolls`, `useEvents`, etc. | `/src/lib/store-context.tsx` |
