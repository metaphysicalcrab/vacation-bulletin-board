# Coding Standards — Vacation Bulletin Board

> **Last updated:** 2026-03-23
> **Extends:** Universal standards in `.dev/universal/CodingStandards.md`
> Project-specific overrides and additions below. Universal standards apply unless overridden here.
>
> Claude Code: Fill in the sections below as patterns emerge during development.
> When you establish a pattern, document it here so future sessions follow it.

## Project Context

<!-- Claude Code: Fill these in during first real development session -->

<!-- What type of application is this? (Web API, SPA, CLI, game, library, etc.) -->
**Application type:** Web application (bulletin board)

<!-- What's the primary language and framework? -->
**Primary language:** TypeScript
**Framework:** Next.js 15 (App Router) / React 19

<!-- What ORM or data access approach? (EF Core, Prisma, Drizzle, raw SQL, etc.) -->
**Data access:** TinyBase (local data store)

<!-- What test framework and approach? (xUnit, Vitest, Jest, Godot testing, etc.) -->
**Testing:**

<!-- What dependency injection approach? (Built-in DI, manual, none, etc.) -->
**DI approach:**

<!-- What logging approach? (ILogger, console, Serilog, Pino, etc.) -->
**Logging:**

<!-- What's the error handling strategy? (Result pattern, exceptions, error boundaries, etc.) -->
**Error handling:**

## Project-Specific Overrides

<!-- Add overrides here when this project deviates from universal standards.
     Always log the reason in Decisions.md. Example:

     ### Override: Use `snake_case` for API response fields
     - **Universal standard:** camelCase for JS/TS
     - **This project:** snake_case (to match external Paylocity API format)
     - **Decision:** DEC-003
-->

## Established Patterns

<!-- Claude Code: Add entries as patterns emerge during development.
     These are patterns unique to THIS project that should be consistently followed. -->

### Pattern: [Name]
- **Use when:**
- **Implementation:**
- **Example location:** `/src/...`

## Anti-Patterns (Project-Specific)

<!-- Things we've tried in THIS project that didn't work.
     Cross-reference Learnings.md for the full story. -->

## File & Folder Conventions

<!-- Claude Code: Fill in when the project structure stabilizes -->

<!-- Where do new components go? -->
<!-- Where do tests live relative to source? -->
<!-- How are shared utilities organized? -->
<!-- Are there barrel exports? Index files? -->

## API Conventions

<!-- Claude Code: Fill in when API patterns are established -->

<!-- What's the URL structure? -->
<!-- What's the request/response format? -->
<!-- How is pagination handled? -->
<!-- How are errors returned to clients? -->
<!-- What status codes are used for what? -->
