# Learnings — Vacation Bulletin Board

> Hard-won knowledge. Bugs, gotchas, surprises, and better approaches discovered through experience.
> Claude Code: **Read this before implementing.** Add entries when something unexpected happens.
> **Never delete entries** — consolidate during periodic reviews.
> Recurring learnings should be promoted to CodingStandards.md as formal standards.

## L-001 — Next.js 16 to 15 downgrade for Vercel compatibility
- **Date:** 2026-03-23
- **Category:** Tool
- **Severity:** High
- **What happened:** Initial project was scaffolded with Next.js 16, but Vercel deployment failed.
- **Root cause:** Next.js 16 had compatibility issues with the Vercel build pipeline at the time. An intermediate attempt to add a Vercel adapter also failed.
- **Solution/Workaround:** Downgraded to Next.js 15 (^15.5.14) which deployed successfully.
- **Prevention:** Use Next.js 15 for now. Check Vercel compatibility before upgrading to Next.js 16.
- **Time lost:** ~1-2 sessions of debugging
- **Related:** Git commits 20de4fc, 87fe8f5

## L-002 — TinyBase only supports string and number cell types
- **Date:** 2026-03-23
- **Category:** Gotcha
- **Severity:** Medium
- **What happened:** Attempted to use boolean values for fields like `pinned` and `closed`.
- **Root cause:** TinyBase schema validation only accepts `{ type: "string" }` or `{ type: "number" }`. No boolean, array, or object types.
- **Solution/Workaround:** Use `0` and `1` numbers for booleans. Use `JSON.stringify()` for arrays/objects (e.g., poll options stored as a JSON string).
- **Prevention:** Always use number 0/1 for boolean fields in TinyBase. Document this in CodingStandards.md anti-patterns.
- **Related:** `/src/lib/store.ts` — `pinned`, `closed` fields

## L-003 — React 19 requires pinned versions (not caret ranges)
- **Date:** 2026-03-23
- **Category:** Gotcha
- **Severity:** Low
- **What happened:** Using caret ranges for `react` and `react-dom` caused version resolution issues.
- **Root cause:** React 19 was relatively new; caret ranges could resolve to incompatible pre-release versions.
- **Solution/Workaround:** Pin exact versions: `react@19.2.4` and `react-dom@19.2.4`.
- **Prevention:** Keep React pinned to exact versions in package.json.
- **Related:** Stack.md — react and react-dom are marked as "Pinned: Yes"

## L-004 — Unused dependencies cause Vercel build failures
- **Date:** 2026-03-23
- **Category:** Tool
- **Severity:** Medium
- **What happened:** Vercel build failed due to unused/incompatible dependencies in package.json.
- **Root cause:** Dependencies left over from initial scaffolding that weren't needed and caused conflicts during the build step.
- **Solution/Workaround:** Removed unused dependencies (commit 29674c6).
- **Prevention:** Clean up unused dependencies before deploying. Run the build locally before pushing.
- **Related:** Git commit 29674c6

## L-005 — MergeableStore required for TinyBase synchronization
- **Date:** 2026-03-24
- **Category:** Gotcha
- **Severity:** High
- **What happened:** Attempted to use TinyBase synchronizers with regular `Store`.
- **Root cause:** Synchronizers (WsSynchronizer, BroadcastChannelSynchronizer) require `MergeableStore` which includes HLC timestamps and CRDT merge logic. Regular `Store` has no conflict resolution metadata.
- **Solution/Workaround:** Migrated `createStore()` to `createMergeableStore()`. The API is backwards-compatible — all existing `setRow`, `getTable`, etc. calls work unchanged.
- **Prevention:** Use `MergeableStore` from the start if sync is a possibility. It has no downside for single-device use.
- **Related:** DEC-007, `src/lib/store.ts`

## L-006 — WebSocket sync uses URL path as room identifier
- **Date:** 2026-03-24
- **Category:** Pattern
- **Severity:** Low
- **What happened:** TinyBase WsServer uses the WebSocket URL path to route messages between clients. Clients connecting to `ws://server/trip123` only sync with other clients on the same path.
- **Root cause:** By design — TinyBase WsServer listens to any path, treating each as a distinct "room".
- **Solution/Workaround:** Use `tripId` as the WebSocket URL path (e.g., `ws://localhost:8048/{tripId}`). This naturally isolates trip data.
- **Prevention:** N/A — this is the intended usage pattern.
- **Related:** `server/index.js`, `src/lib/store-context.tsx`
