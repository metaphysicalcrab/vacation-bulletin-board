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
