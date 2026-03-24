# Design Standards — Vacation Bulletin Board

> **Last updated:** 2026-03-24
> **Extends:** Universal standards in `.dev/universal/DesignStandards.md`
> Project-specific UX decisions and overrides here.

## UX Principles (Project-Specific)

1. **Casual & quick** — This is a vacation planning app, not a productivity tool. Interactions should feel lightweight and fun. Minimize required fields, favor one-tap actions.
2. **Mobile-first** — Designed primarily for phone use. Full-height layouts, large tap targets, bottom navigation for thumb reach.
3. **Glanceable** — Key information (pinned messages, poll results, today's events) should be scannable without interaction. Use visual hierarchy, progress bars, and relative timestamps.

## Navigation Patterns

- **Home → Trip:** User enters name, then creates or joins a trip via code. No persistent session — name is stored in localStorage.
- **Trip shell:** All trip pages share a layout with a top header (trip name + code + back arrow) and a bottom tab bar (Chat, Board, Polls, Itinerary).
- **Bottom tabs:** Four fixed tabs using Lucide icons. Active tab highlighted with copper accent color. Tabs are: MessageCircle (Chat), Megaphone (Board), BarChart3 (Polls), Calendar (Itinerary).
- **No deep navigation:** All features are single-page. No detail views, modals, or multi-step flows. Create forms are inline at the top of each page.

## Form Patterns (Project-Specific)

- **Inline forms:** Create forms appear at the top of the feature page, not on separate routes. Collapse/expand is not used — the form is always visible.
- **Minimal required fields:** Only the essential field is required (message text, poll question, event title). Optional fields (description, location) have empty string defaults.
- **Submit behavior:** Button is disabled when required fields are empty. On submit, store helper is called, form is cleared, new item appears in the list immediately.
- **No edit/delete:** Items are immutable after creation (exception: pin/unpin on messages). This keeps the UX simple and avoids confirmation dialogs.

## Empty States

- Display a centered icon + descriptive message + action hint when a list has no items.
- Example: Board page shows a Megaphone icon with "No pinned messages yet" and a link to the chat.

## Content & Voice

- **Casual tone** — Friendly, not corporate. "No pinned messages yet" not "There are currently no pinned messages."
- **General audience** — No technical jargon. Labels are plain English: "Chat", "Board", "Polls", "Itinerary".
- **Relative timestamps** — Show "just now", "5m ago", "2h ago" for recent activity. Full dates only for items older than a week.
