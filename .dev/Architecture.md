# Architecture — Vacation Bulletin Board

> **Last updated:** 2026-03-24 (sync + CRUD update)
> Claude Code: Update this doc when adding components, changing relationships, or modifying infrastructure.

## System Overview

Voyage Board is a local-first vacation coordination app. Groups create or join a trip via a shared code, then collaborate through chat messages, a pinned bulletin board, polls, and a shared itinerary. Data is stored client-side using TinyBase MergeableStore with localStorage persistence as an offline fallback. Multi-device sync is handled via a WebSocket relay server using TinyBase's built-in synchronizers (CRDT-based). Same-browser tab sync uses BroadcastChannel. No authentication — identity is browser-based (UUID generated on first visit).

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 15 / React 19 | App Router |
| Styling | Tailwind CSS v4 | With PostCSS, `@theme inline` for semantic tokens |
| Data | TinyBase v8 (MergeableStore) | CRDT-based local data store with schema validation and sync |
| Sync | TinyBase WsSynchronizer + BroadcastChannel | Multi-device WebSocket sync + same-browser tab sync |
| Sync Server | TinyBase WsServer | Lightweight WebSocket relay (`server/`) |
| Language | TypeScript 5 | Strict mode |
| Icons | Lucide React | SVG icon library |
| Utilities | CVA, clsx, tailwind-merge | Component variants & class merging |

## Component Map

### Component: StoreProvider
- **Purpose:** Initializes TinyBase MergeableStore, manages current user/trip state, hydrates from localStorage, sets up BroadcastChannel and WebSocket sync
- **Location:** `/src/lib/store-context.tsx`
- **Dependencies:** TinyBase `MergeableStore`, `createAppStore()`, `createBroadcastChannelSynchronizer`, `createWsSynchronizer`
- **API/Interface:** React Context providing `store`, `currentUser`, `currentTripId`, `connectionStatus`, `setCurrentUser`, `setCurrentTripId`
- **Sync:** BroadcastChannel for tab sync (always on), WebSocket for multi-device (connects when tripId is set, auto-reconnects with exponential backoff)

### Component: AuthorName
- **Purpose:** Reactively resolves a userId to a display name via the members table
- **Location:** `/src/components/author-name.tsx`
- **Dependencies:** `useMemberName` hook from store-context
- **Props:** `tripId`, `authorId`, `fallbackName?`, `className?`

### Component: MemberList
- **Purpose:** Slide-out panel showing trip members with admin actions (promote/demote, remove)
- **Location:** `/src/components/member-list.tsx`
- **Dependencies:** `useTableRows`, `isAdmin`, `setMemberRole`, `removeMember`

### Component: Sync Server
- **Purpose:** WebSocket relay for multi-device TinyBase sync
- **Location:** `/server/index.js`
- **Dependencies:** `tinybase/synchronizers/synchronizer-ws-server`, `ws`
- **Architecture:** Each trip ID maps to a WebSocket path/room. Server routes sync messages between clients on the same path.

### Component: Home Page
- **Purpose:** Entry point — user sign-up, trip creation, trip joining, trip listing
- **Location:** `/src/app/page.tsx`
- **Dependencies:** StoreProvider context, store helpers (`createTrip`, `addMember`)

### Component: Trip Layout
- **Purpose:** Shared layout for all trip pages — top header (trip name/code) + bottom tab navigation
- **Location:** `/src/app/trip/[tripId]/layout.tsx`
- **Dependencies:** `useRow` (trip data), `useAppStore` (set current trip)
- **Tabs:** Chat, Board, Polls, Itinerary

### Component: Chat Page
- **Purpose:** Real-time-style message board with pin/unpin functionality
- **Location:** `/src/app/trip/[tripId]/page.tsx`
- **Dependencies:** `useTableRows` (messages), `addMessage`, `togglePin`

### Component: Bulletin Board Page
- **Purpose:** Gallery view of pinned messages only
- **Location:** `/src/app/trip/[tripId]/board/page.tsx`
- **Dependencies:** `useTableRows` (messages filtered by pinned)

### Component: Polls Page
- **Purpose:** Create polls, vote on options, view results with progress bars
- **Location:** `/src/app/trip/[tripId]/polls/page.tsx`
- **Dependencies:** `useTableRows` (polls, pollVotes), `addPoll`, `votePoll`

### Component: Itinerary Page
- **Purpose:** Create events with date/time/location, view grouped by day
- **Location:** `/src/app/trip/[tripId]/itinerary/page.tsx`
- **Dependencies:** `useTableRows` (events), `addEvent`

### Component: UI Primitives (Button, Input, Textarea)
- **Purpose:** Styled base components with variant support (CVA)
- **Location:** `/src/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`
- **Dependencies:** CVA, cn() utility

## Data Flow

```
localStorage (JSON)
    ↕ hydrate on mount / persist on change
TinyBase Store (in-memory)
    ↕ addTableListener / addRowListener
React Context (StoreProvider)
    ↕ useAppStore() / useTableRows() / useRow()
Page Components
    → call store helper functions (addMessage, addPoll, etc.)
    → TinyBase store updates → listener fires → useSyncExternalStore re-renders
```

**Persistence:** `StoreProvider` loads from `vacation-bb-store` localStorage key on mount, and attaches a `addTablesListener` that writes back on every change. User identity is stored separately in `vacation-bb-user`.

## Data Model

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `trips` | id, name, code, createdAt | 6-char alphanumeric join code |
| `members` | id, tripId, name, role, joinedAt | role: "admin" or "member" |
| `messages` | id, tripId, authorId, authorName, text, timestamp, pinned | pinned: 0/1 (TinyBase uses numbers) |
| `polls` | id, tripId, authorId, authorName, question, options, createdAt, closed | options: JSON-stringified string array |
| `pollVotes` | id, pollId, memberId, memberName, optionIndex | One vote per member per poll (enforced in code) |
| `events` | id, tripId, authorId, authorName, title, description, startTime, endTime, location, createdAt | Grouped by day in UI |

## Integration Points

None. This is a fully client-side application with no external APIs, backend services, or webhooks. All data lives in the browser's localStorage.

## Directory Structure

```
/
├── .dev/                   # Project intelligence framework
│   ├── features/           # Feature documentation
│   └── universal/          # Shared standards templates
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout (StoreProvider wrapper)
│   │   ├── page.tsx        # Home page (login/create/join)
│   │   ├── globals.css     # CSS custom properties + theme tokens
│   │   └── trip/
│   │       └── [tripId]/
│   │           ├── layout.tsx      # Trip shell (header + bottom nav)
│   │           ├── page.tsx        # Chat
│   │           ├── board/page.tsx  # Bulletin board
│   │           ├── polls/page.tsx  # Polls
│   │           └── itinerary/page.tsx  # Itinerary
│   ├── components/
│   │   └── ui/             # Styled primitives (Button, Input, Textarea)
│   └── lib/
│       ├── store.ts        # TinyBase schema + helper functions
│       ├── store-context.tsx  # React Context + reactive hooks
│       └── utils.ts        # cn(), generateTripCode(), formatTime()
├── public/                 # Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Patterns in Use

- **Store helper pattern:** Pure functions in `store.ts` that take a `Store` instance + params and call `store.setRow()`. Keeps mutation logic centralized outside components. See [CodingStandards.md](CodingStandards.md).
- **Reactive hooks pattern:** `useTableRows` and `useRow` use `useSyncExternalStore` with TinyBase listeners for efficient re-rendering. See [CodingStandards.md](CodingStandards.md).
- **Semantic token pattern:** All colors use CSS custom properties mapped through `@theme inline` in Tailwind. Components reference tokens like `bg-surface` never raw colors. See DEC-002.
- **Inline create forms:** Each feature page has a creation form at the top and a list below — no separate create/edit pages.

## Known Constraints & Technical Debt

- **No backend:** All data is localStorage-only. No sync between devices or users. Multiple users on the same trip must share a browser or manually coordinate.
- **No authentication:** User identity is a self-declared name stored in localStorage. No verification.
- **TinyBase boolean limitation:** TinyBase only supports string/number primitives. Booleans are stored as 0/1 numbers (e.g., `pinned`, `closed`).
- **Poll options as JSON string:** The `options` field in polls is a JSON-stringified array because TinyBase doesn't support array cell values.
- **No edit/delete on messages or events:** Currently read-only after creation (pins are the exception).
- **No role enforcement:** Member roles ("admin"/"member") are tracked but not enforced in the UI.
