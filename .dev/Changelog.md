# Changelog — Vacation Bulletin Board

> Session log. One entry per Claude Code session summarizing what was accomplished.
> Newest sessions at top. Claude Code: Add an entry at the end of each session.

<!--
FORMAT:

## YYYY-MM-DD — [Brief session summary]
**Focus:** [What this session was primarily about]
- Key accomplishment or change
- Key accomplishment or change
- Issues encountered (reference L-### in Learnings.md if logged)
- Decisions made (reference DEC-### in Decisions.md if logged)
-->

## 2026-03-24 — Code Quality: Type Safety, Accessibility, Component Extraction
**Focus:** Four-phase codebase improvement — hook fixes, type safety, accessibility, and component extraction
- **Phase 1 — Quick Wins:**
  - Fixed `useTableRows()` subscribe callback missing `filterField`/`filterValue` deps (stale closure bug)
  - Fixed `useMemberName()` subscribe callback missing `tripId`/`authorId`/`fallbackName` deps
  - Added try/catch guard on `JSON.parse` in polls page for malformed options
  - Added `htmlFor`/`id` associations to all form labels on home page (3 inputs)
  - Changed member list from `<div>` to semantic `<ul>`/`<li>` markup
  - Added explicit `Member | null` return type to `getMemberForTrip()`, removed downstream `as` casts
- **Phase 2 — Type Safety Overhaul:**
  - Created 6 typed wrapper hooks: `useTrips`, `useMembers`, `useMessages`, `usePolls`, `usePollVotes`, `useEvents`
  - Updated all 8 consumer files to use typed hooks, eliminating ~60 `as string`/`as number` casts
- **Phase 3 — Accessibility:**
  - Created reusable `ConfirmDialog` component, replaced inline confirmations in 4 files
  - Added descriptive `aria-label` to poll vote buttons (option name + vote count + percentage)
  - Added focus management to member list panel (auto-focus close button on mount)
- **Phase 4 — Component Extraction:**
  - Created shared `SearchBar` component, used in chat page
  - Extracted `MessageItem` and `ChatInput` from chat page (339→120 lines)
  - Extracted `PollCard` and `PollForm` from polls page (332→105 lines)
  - Extracted `EventCard` and `EventForm` from itinerary page (413→210 lines)
- **New files:** `src/components/confirm-dialog.tsx`, `src/components/search-bar.tsx`, `src/components/chat/message-item.tsx`, `src/components/chat/chat-input.tsx`, `src/components/polls/poll-card.tsx`, `src/components/polls/poll-form.tsx`, `src/components/itinerary/event-card.tsx`, `src/components/itinerary/event-form.tsx`

## 2026-03-24 — Major: Multi-User Sync, CRUD, Polish
**Focus:** Fix broken multi-user model, add real-time sync, full CRUD on all entities, and UX polish
- **Phase 1 — Foundation:**
  - Migrated `createStore()` to `createMergeableStore()` (CRDT-based, enables sync) (DEC-005)
  - Fixed member identity: added `userId` field, switched from name-based to ID-based lookups (DEC-006)
  - Added `AuthorName` component for live author name resolution via members table
  - Added WebSocket sync server (`server/`) using TinyBase `createWsServer` for multi-device sync (DEC-007)
  - Added `WsSynchronizer` client with auto-reconnect (exponential backoff)
  - Added `BroadcastChannelSynchronizer` for same-browser tab sync
  - Added connection status indicator (green/amber/gray dot) in trip header
  - Data migration for existing member rows without `userId`
- **Phase 2 — Core CRUD:**
  - Message edit/delete with inline editing and "(edited)" indicator
  - Event edit/delete with form reuse
  - Poll close/reopen with "Closed" badge and disabled voting
  - Poll delete with vote cascade
  - Member list slide-out panel (Users icon in header)
  - Role enforcement: admins can delete others' content, promote/demote members, remove members
- **Phase 3 — Polish:**
  - Search in chat (message text) and itinerary (title/description/location)
  - Unread indicators (copper dots on tab icons for new content)
  - Read markers table for tracking per-user, per-tab last-read timestamps
  - Rich empty states with icons, descriptions, and action buttons
  - CSS animations (slide-in, fade-in) for panels
  - Accessibility: skip-to-content link, ARIA roles/labels on nav and buttons
- **Decisions:** DEC-005, DEC-006, DEC-007, DEC-008
- **New files:** `src/components/author-name.tsx`, `src/components/member-list.tsx`, `server/index.js`, `server/package.json`

## 2026-03-24 — Documentation Overhaul
**Focus:** Fill in all incomplete `.dev/` documentation
- Populated Architecture.md with full system overview, component map, data flow, data model, directory structure
- Created `.dev/.summary.md` for quick task context loading
- Populated FeatureIndex.md with all 5 features, 4 systems, and 5 utilities
- Added 4 learnings to Learnings.md (L-001 through L-004)
- Backfilled Changelog.md with missing entries for app build and deployment work
- Filled CodingStandards.md with established patterns, file conventions, anti-patterns
- Filled DesignStandards.md with UX principles, navigation, form patterns, voice
- Added DEC-003 (TinyBase) and DEC-004 (bottom tab navigation) to Decisions.md

## 2026-03-24 — Dark Mode Theme with Warm Copper & Taupe Colors
**Focus:** Implement default dark mode across the entire app
- Defined comprehensive semantic CSS variable system in globals.css (30+ tokens)
- Registered all color tokens via Tailwind v4 `@theme inline` for utility class usage
- Updated all UI primitives (Button, Input, Textarea) to use semantic color tokens
- Updated all 6 page components to replace hardcoded blue/gray/white classes
- Color palette: deep warm darks (#1a1614), copper accents (#c2875a), taupe surfaces (#292524)
- Added `color-scheme: dark` for native input styling
- Decisions made: DEC-002

## 2026-03-23 — Build & Deploy Fixes
**Focus:** Resolve Vercel deployment failures
- Attempted Vercel adapter for Next.js 16 — didn't work (L-001)
- Downgraded Next.js 16 → 15 for Vercel compatibility
- Removed unused dependencies causing build failures (L-004)

## 2026-03-23 — Voyage Board App Built
**Focus:** Build the full vacation group chat and bulletin board application
- Implemented trip creation and joining via 6-character codes
- Built chat page with message sending, pin/unpin, relative timestamps
- Built bulletin board page showing pinned messages
- Built polls page with create form, voting, progress bar results
- Built itinerary page with event creation, day grouping, location/time display
- Created TinyBase store with schema for trips, members, messages, polls, pollVotes, events
- Built StoreProvider with localStorage persistence and reactive hooks (useTableRows, useRow)
- Created UI primitives (Button, Input, Textarea) with CVA variants
- Designed bottom tab navigation layout for trip pages
- Decisions made: DEC-003, DEC-004

## 2026-03-23 — Project Initialized
**Focus:** Framework setup
- Initialized Dev Framework (.dev/ directory structure)
- Configured universal standards and project templates
