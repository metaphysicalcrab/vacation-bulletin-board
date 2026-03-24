# Design System — Vacation Bulletin Board

> **Last updated:** 2026-03-24
> **Extends:** Universal tokens in `.dev/universal/DesignSystem.md`
> Override tokens and add project-specific components here.

## Theme

**Dark mode only** — warm copper and taupe palette. No light mode or toggle.

## Project Token Overrides

All tokens defined as CSS custom properties in `src/app/globals.css` and registered via `@theme inline` for Tailwind utility usage.

```css
:root {
  /* Backgrounds */
  --background: #1a1614;        /* bg-background — page background */
  --surface: #292524;           /* bg-surface — cards, elevated areas */
  --surface-hover: #302c2a;     /* bg-surface-hover */
  --surface-active: #3a3533;    /* bg-surface-active */
  --surface-inset: #211e1c;     /* bg-surface-inset — inputs */

  /* Borders */
  --border: #44403c;            /* border-border */
  --border-subtle: #352f2c;     /* border-border-subtle — dividers */
  --border-accent: #8b6914;     /* border-border-accent — selected states */

  /* Text */
  --foreground: #ede8e3;        /* text-foreground — primary */
  --foreground-secondary: #a8a29e; /* text-foreground-secondary — muted */
  --foreground-tertiary: #78716c;  /* text-foreground-tertiary — placeholders */

  /* Accent (copper) */
  --accent: #c2875a;            /* bg-accent / text-accent */
  --accent-hover: #d4a574;      /* bg-accent-hover */
  --accent-active: #b07848;     /* bg-accent-active */
  --accent-foreground: #1a1614; /* text-accent-foreground — text on copper */
  --accent-subtle: #2e2520;     /* bg-accent-subtle — tinted surface */

  /* Destructive (warm red) */
  --destructive: #dc6b5a;       /* bg-destructive / text-destructive */

  /* Focus */
  --ring: #c2875a;              /* ring-ring */

  /* Chat */
  --chat-own: #7c5a36;          /* bg-chat-own */
  --chat-other: #292524;        /* bg-chat-other */
}
```

## Component Library

### Component: Button
- **Location:** `/src/components/ui/button.tsx`
- **Variants:** default (copper), outline (surface + border), ghost (text only), destructive (warm red)
- **Sizes:** default, sm, lg, icon

### Component: Input
- **Location:** `/src/components/ui/input.tsx`
- **Styling:** `bg-surface-inset border-border`, copper focus ring

### Component: Textarea
- **Location:** `/src/components/ui/textarea.tsx`
- **Styling:** Same as Input

## Layout Patterns

- Mobile-first full-height layout
- Trip pages: header + content + bottom navigation (all using `bg-surface`)

## Icon System

Using `lucide-react` for all icons.

## Animation / Motion

Transitions use Tailwind's `transition-colors` for interactive states.
