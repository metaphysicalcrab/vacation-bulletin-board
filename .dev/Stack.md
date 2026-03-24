# Stack & Dependencies — Vacation Bulletin Board

> **Last updated:** 2026-03-23
> Claude Code: Update when dependencies are added, removed, or upgraded.
> Check this before suggesting package upgrades or new dependencies.

## Runtime & Language

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | — | Check `.nvmrc` or `engines` field |
| TypeScript | ^5 | Strict mode |

## Core Dependencies

| Package | Version | Purpose | Pinned? |
|---------|---------|---------|---------|
| next | ^15.5.14 | Framework (App Router) | No |
| react | 19.2.4 | UI library | Yes |
| react-dom | 19.2.4 | React DOM renderer | Yes |
| tinybase | ^8.0.2 | Local data store | No |
| lucide-react | ^0.577.0 | Icon library | No |
| class-variance-authority | ^0.7.1 | Component variant utility | No |
| clsx | ^2.1.1 | className utility | No |
| tailwind-merge | ^3.5.0 | Tailwind class merging | No |
| uuid | ^13.0.0 | Unique ID generation | No |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @tailwindcss/postcss | ^4 | Tailwind CSS PostCSS plugin |
| tailwindcss | ^4 | Utility-first CSS framework |
| eslint | ^9 | Linting |
| eslint-config-next | ^15.5.14 | Next.js ESLint config |
| @types/node | ^20 | Node.js type definitions |
| @types/react | ^19 | React type definitions |
| @types/react-dom | ^19 | React DOM type definitions |
| @types/uuid | ^10 | UUID type definitions |

## External Services & APIs

| Service | Purpose | Auth Method | Docs |
|---------|---------|-------------|------|
<!-- None currently -->

## Infrastructure

| Component | Provider | Notes |
|-----------|----------|-------|
<!-- Fill in when deployed -->

## Version Constraints

<!-- Document known compatibility issues and version pins -->

## Upgrade Log

| Date | Package | From | To | Notes |
|------|---------|------|----|-------|
<!-- Track upgrades here -->
