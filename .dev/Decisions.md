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
