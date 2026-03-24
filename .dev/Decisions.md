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
