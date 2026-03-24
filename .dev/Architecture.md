# Architecture — Vacation Bulletin Board

> **Last updated:** 2026-03-23
> Claude Code: Update this doc when adding components, changing relationships, or modifying infrastructure.

## System Overview

<!-- High-level: what does this system do and how is it structured? -->

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 15 / React 19 | App Router |
| Styling | Tailwind CSS v4 | With PostCSS |
| Data | TinyBase v8 | Local data store |
| Language | TypeScript 5 | Strict mode |
| Icons | Lucide React | SVG icon library |

## Component Map

<!-- List major components/modules. Add entries as the project grows. -->

### Component: [Name]
- **Purpose:**
- **Location:** `/src/...`
- **Dependencies:**
- **API/Interface:**

## Data Flow

<!-- Request lifecycle, event flows, data transformation pipeline -->

## Integration Points

<!-- External services, APIs, webhooks, third-party libraries -->

## Directory Structure

```
<!-- Update as project grows — this is the source of truth for "where does X go?" -->
/
├── .dev/               # Project intelligence framework
├── src/                # Source code
├── tests/              # Test files
└── ...
```

## Key Patterns in Use

<!-- Document adopted patterns. Link to Decisions.md for the "why". -->

## Known Constraints & Technical Debt

<!-- Be honest. Future sessions need to know about landmines. -->
