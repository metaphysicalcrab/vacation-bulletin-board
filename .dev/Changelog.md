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

## 2026-03-24 — Dark Mode Theme with Warm Copper & Taupe Colors
**Focus:** Implement default dark mode across the entire app
- Defined comprehensive semantic CSS variable system in globals.css (30+ tokens)
- Registered all color tokens via Tailwind v4 `@theme inline` for utility class usage
- Updated all UI primitives (Button, Input, Textarea) to use semantic color tokens
- Updated all 6 page components to replace hardcoded blue/gray/white classes
- Color palette: deep warm darks (#1a1614), copper accents (#c2875a), taupe surfaces (#292524)
- Added `color-scheme: dark` for native input styling
- Decisions made: DEC-002

## 2026-03-23 — Project Initialized
**Focus:** Framework setup
- Initialized Dev Framework (.dev/ directory structure)
- Configured universal standards and project templates
