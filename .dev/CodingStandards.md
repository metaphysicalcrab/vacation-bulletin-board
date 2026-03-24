# Coding Standards — Vacation Bulletin Board

> **Last updated:** 2026-03-24
> **Extends:** Universal standards in `.dev/universal/CodingStandards.md`
> Project-specific overrides and additions below. Universal standards apply unless overridden here.
>
> Claude Code: Fill in the sections below as patterns emerge during development.
> When you establish a pattern, document it here so future sessions follow it.

## Project Context

**Application type:** Web application (local-first vacation coordination)

**Primary language:** TypeScript
**Framework:** Next.js 15 (App Router) / React 19

**Data access:** TinyBase v8 (local data store with schema validation, persisted to localStorage)

**Testing:** Not yet established

**DI approach:** React Context — `StoreProvider` wraps the app and provides the TinyBase store instance

**Logging:** None — client-side only app with no logging infrastructure

**Error handling:** Silent catch blocks for localStorage parse/quota errors. No error boundaries yet.

## Project-Specific Overrides

<!-- None currently — following universal standards -->

## Established Patterns

### Pattern: Store Helper Functions
- **Use when:** Adding, modifying, or querying data in TinyBase
- **Implementation:** Export pure functions from `store.ts` that accept a `Store` instance as the first argument. Each function generates a UUID, calls `store.setRow()`, and returns the new row ID. This keeps mutation logic centralized and testable outside React.
- **Example location:** `/src/lib/store.ts` — `addMessage()`, `addPoll()`, `votePoll()`, `createTrip()`

### Pattern: Typed Table Hooks
- **Use when:** Rendering data from a TinyBase table in a component
- **Implementation:** Use typed hooks (`useMessages(tripId)`, `usePolls(tripId)`, `useEvents(tripId)`, `useMembers(tripId)`, `usePollVotes()`, `useTrips()`) instead of raw `useTableRows()`. These wrap `useTableRows` with proper return types, eliminating `as string`/`as number` casts in components. For single records, use `useRow(tableName, rowId)`.
- **Example location:** `/src/lib/store-context.tsx`
- **Anti-pattern:** Don't use `useTableRows()` directly in page components — use a typed hook instead.

### Pattern: Reusable ConfirmDialog
- **Use when:** Showing an inline delete/remove confirmation
- **Implementation:** Use `<ConfirmDialog message="..." onConfirm={...} onCancel={...} />` instead of inline Yes/No button markup.
- **Example location:** `/src/components/confirm-dialog.tsx`

### Pattern: Inline Create Form + List
- **Use when:** Building a feature page (polls, itinerary, chat)
- **Implementation:** Each feature page renders a creation form at the top and a scrollable list below. No separate routes for create/edit. Form state is managed with `useState` hooks. On submit, call the relevant store helper and clear the form.
- **Example location:** `/src/app/trip/[tripId]/polls/page.tsx`

### Pattern: Semantic Color Tokens
- **Use when:** Styling any component
- **Implementation:** Always use semantic Tailwind classes (`bg-surface`, `text-foreground`, `border-border`) mapped from CSS custom properties. Never use raw Tailwind colors (`bg-white`, `text-gray-500`). See DesignSystem.md for the full token list.
- **Example location:** `/src/app/globals.css`, any page component

## Anti-Patterns (Project-Specific)

- **Don't use raw color classes** — `bg-white`, `text-gray-*`, etc. are banned. Use semantic tokens only.
- **Don't store booleans in TinyBase** — Use `0` and `1` numbers. TinyBase schema only supports `string` and `number` types.
- **Don't store arrays/objects in TinyBase cells** — Use `JSON.stringify()` for complex values (see `poll.options`).

## File & Folder Conventions

- **Pages:** `/src/app/` using Next.js App Router conventions. Dynamic routes use `[param]` folders.
- **Components:** `/src/components/ui/` for styled primitives. `/src/components/chat/`, `/src/components/polls/`, `/src/components/itinerary/` for feature-specific extracted components. Shared components (`confirm-dialog.tsx`, `search-bar.tsx`, `author-name.tsx`, `member-list.tsx`) at `/src/components/`.
- **Logic:** `/src/lib/` for store, context, and utilities. `store.ts` for schema + mutations, `store-context.tsx` for React integration, `utils.ts` for pure helpers.
- **No barrel exports** — Import directly from file paths.
- **All components are client components** — `"use client"` directive at top of every component file (required because TinyBase and React hooks are client-only).

## API Conventions

No API routes. This is a fully client-side application. All data operations go through TinyBase store helper functions in `/src/lib/store.ts`.
