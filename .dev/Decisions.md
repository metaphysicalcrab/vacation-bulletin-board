# Decisions — Vacation Bulletin Board

> Architecture Decision Records (ADRs). **Append-only.**
> Claude Code: Add an entry whenever a meaningful technical decision is made.
> **Never delete entries** — mark superseded decisions as `Superseded by DEC-XXX`.

<!--
TEMPLATE — Copy for each new decision:

## DEC-[NUMBER] — [Title]
- **Date:** YYYY-MM-DD
- **Status:** Accepted | Superseded by DEC-XXX | Deprecated
- **Context:** What situation or problem prompted this decision?
- **Options Considered:**
  1. **[Option A]** — Pros: ... / Cons: ...
  2. **[Option B]** — Pros: ... / Cons: ...
- **Decision:** What was chosen and why.
- **Consequences:** What this means going forward. Trade-offs accepted.
- **Related:** Links to relevant learnings, architecture sections, or other decisions.
-->

## DEC-008 — Context Menu Pattern for Edit/Delete Actions
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** Needed a UI pattern for edit/delete on messages, events, and polls that fits the casual mobile-first design.
- **Options Considered:**
  1. **Modal dialogs** — Pros: familiar / Cons: heavyweight, interrupts flow
  2. **Long-press context menu** — Pros: mobile-native / Cons: not discoverable, no hover equivalent
  3. **Hover-reveal inline action buttons** — Pros: discoverable on desktop, compact / Cons: less visible on mobile
- **Decision:** Hover-reveal inline action buttons with inline confirmation for destructive actions ("Delete? Yes/No"). No modals. Consistent across chat, itinerary, and polls.
- **Consequences:** On mobile, users tap the message area to reveal actions. Inline confirmations prevent accidental deletes.

## DEC-007 — WebSocket Relay Server for Multi-Device Sync
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** Multi-user experience was broken — each browser had isolated localStorage. Needed true multi-device sync for simultaneous collaboration.
- **Options Considered:**
  1. **BroadcastChannel only** — Pros: no server / Cons: same-browser only
  2. **Custom WebSocket relay** — Pros: works cross-device / Cons: need to maintain server
  3. **TinyBase built-in WsServer** — Pros: minimal code, CRDT merge, path-based rooms / Cons: requires hosted server
- **Decision:** TinyBase `createWsServer` with `createWsSynchronizer` client. Each trip ID maps to a WebSocket "path" (room). Server is ~15 lines. BroadcastChannel added alongside for tab-local sync.
- **Consequences:** Requires `MergeableStore` (CRDT). Server must be deployed separately. localStorage kept as offline fallback. Auto-reconnect with exponential backoff.

## DEC-006 — Denormalized authorName as Fallback Cache
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** `authorName` was baked into every message/poll/event. Name changes would make old records stale.
- **Decision:** Keep `authorName` in schema as a write-once fallback. New code resolves names live via `resolveAuthorName()` and `<AuthorName>` component which looks up the members table by userId.
- **Consequences:** Display code always shows current name. Fallback handles orphaned records where member has been removed.

## DEC-005 — ID-Based Member Identity
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** Members were identified by name (`m.name === currentUser.name`). Two users with same name would collide. Name changes broke association.
- **Decision:** Added `userId` field to members table storing `currentUser.id` (browser-generated UUID). Membership checks use `m.userId === currentUser.id`.
- **Consequences:** Existing data migrated via one-time backfill in StoreProvider. Two "John" users now get separate member records.

## DEC-004 — Bottom Tab Navigation for Trip Pages
- **Date:** 2026-03-23
- **Status:** Accepted
- **Context:** Trip pages need navigation between Chat, Board, Polls, and Itinerary. Needed a pattern suitable for mobile-first design.
- **Options Considered:**
  1. **Sidebar navigation** — Pros: familiar on desktop / Cons: wastes horizontal space on mobile, requires hamburger menu
  2. **Top tabs** — Pros: visible / Cons: competes with header, harder to reach on large phones
  3. **Bottom tab bar** — Pros: thumb-friendly, standard mobile pattern, always visible / Cons: takes vertical space
- **Decision:** Bottom tab bar with 4 fixed tabs (Chat, Board, Polls, Itinerary) using Lucide icons. Active tab highlighted with copper accent color.
- **Consequences:** Maximum 4-5 tabs before the bar gets crowded. New features should be sub-features of existing tabs rather than new tabs.
- **Related:** `/src/app/trip/[tripId]/layout.tsx`, DesignStandards.md navigation section

## DEC-003 — TinyBase for Local-First State Management
- **Date:** 2026-03-23
- **Status:** Accepted
- **Context:** App needs a data store for trips, messages, polls, and events. No backend is planned initially — all data is client-side.
- **Options Considered:**
  1. **Plain React state + localStorage** — Pros: no dependencies / Cons: manual serialization, no schema, no reactive queries
  2. **IndexedDB (via Dexie/idb)** — Pros: large storage, structured queries / Cons: async API adds complexity, overkill for this use case
  3. **TinyBase** — Pros: schema validation, reactive listeners, simple API, built-in persistence patterns / Cons: less common, stores only string/number primitives
- **Decision:** TinyBase v8 for its reactive listener model and schema validation. Persistence done manually via localStorage JSON serialization in StoreProvider.
- **Consequences:** No boolean or array cell types — use 0/1 for booleans and JSON.stringify for arrays. If multi-device sync is needed later, TinyBase has synchronizer APIs that could be explored.
- **Related:** L-002 (TinyBase boolean limitation), Architecture.md data model section

## DEC-002 — Dark-Only Theme with Warm Copper & Taupe Palette
- **Date:** 2026-03-24
- **Status:** Accepted
- **Context:** App needed a visual theme. User requested dark mode as the default with warm copper and taupe colors.
- **Options Considered:**
  1. **Light/dark toggle** — Pros: user choice / Cons: doubles CSS maintenance, more complexity
  2. **Dark-only with semantic tokens** — Pros: simpler, consistent brand identity / Cons: no light option
- **Decision:** Dark-only theme using CSS custom properties mapped to Tailwind via `@theme inline`. Warm copper (#c2875a) for accents, deep taupe (#1a1614) backgrounds, warm gray surfaces (#292524).
- **Consequences:** All color classes must use semantic tokens (e.g., `bg-surface` not `bg-white`). If a light mode is needed later, add a `.light` class variant with overridden CSS variables.
- **Related:** See DesignSystem.md for full token reference.

## DEC-001 — Adopt Dev Framework for Project Intelligence
- **Date:** 2026-03-23
- **Status:** Accepted
- **Context:** Need structured way to maintain project knowledge across Claude Code sessions and prevent context amnesia.
- **Decision:** Using .dev/ directory framework with CLAUDE.md entry point and universal/project-specific doc layers.
- **Consequences:** All significant decisions logged here. Claude Code reads before deciding, writes after deciding. Human review on periodic cadence.
