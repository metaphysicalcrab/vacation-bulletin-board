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
