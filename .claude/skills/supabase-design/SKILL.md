---
name: supabase-design
description: Use this skill when the user wants to build UI components, pages, dashboards, or landing pages with a Supabase-inspired design. Triggers on requests like "design like Supabase", "dark developer UI", "Supabase style", "developer dashboard", "backend tool UI", or any UI that should feel like a modern open-source developer product.
---

# Supabase Design System

Reproduce the exact visual language of Supabase: dark, code-editor-native, precise, and developer-first. Every component should feel like it belongs in the Supabase dashboard or marketing site.

---

## Core Aesthetic

**Vibe**: Developer-native. Terminal-inspired. Open-source energy. Clean but never sterile.
The dark mode is not a feature — it's the default and canonical state. Green means "success", "action", "go".
No gradients for decoration. No rounded blobs. No generic SaaS. Precision over decoration.

---

## Color Palette

Use these exact values as CSS variables:

```css
:root {
  /* Backgrounds */
  --background:        #0f0f0f;   /* deepest background */
  --surface-1:         #1c1c1c;   /* cards, panels */
  --surface-2:         #2a2a2a;   /* inputs, code blocks, inner panels */
  --surface-3:         #333333;   /* hover states, borders */

  /* Brand */
  --brand:             #3ecf8e;   /* Supabase green — primary CTA, links, highlights */
  --brand-hover:       #2db97d;
  --brand-muted:       #3ecf8e22; /* subtle green backgrounds */

  /* Text */
  --text-primary:      #ededed;
  --text-secondary:    #a1a1a1;
  --text-muted:        #666666;
  --text-disabled:     #444444;

  /* Borders */
  --border:            #2a2a2a;
  --border-strong:     #3a3a3a;

  /* Status */
  --success:           #3ecf8e;
  --warning:           #f59e0b;
  --error:             #ef4444;
  --info:              #3b82f6;

  /* Code */
  --code-bg:           #161616;
  --code-border:       #2a2a2a;
}
```

**Rule**: Never use purple, pink, or rainbow gradients. Never use white backgrounds unless it's a code block on the marketing site.

---

## Typography

```css
/* Font stack */
font-family: 'Custom Font', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* For code / monospace blocks */
font-family: 'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace;
```

### Scale
| Role           | Size     | Weight | Color            |
|----------------|----------|--------|------------------|
| Hero title     | 56–72px  | 700    | `--text-primary` |
| Section title  | 32–40px  | 600    | `--text-primary` |
| Card title     | 18–20px  | 600    | `--text-primary` |
| Body           | 15–16px  | 400    | `--text-secondary`|
| Caption/label  | 12–13px  | 500    | `--text-muted`   |
| Code           | 13–14px  | 400    | `--brand`        |

**Rules:**
- Tight letter-spacing on headings: `letter-spacing: -0.02em`
- Line-height for body: `1.6`
- No decorative fonts — everything is clean, neutral, purposeful
- Code snippets inline with body text use `--brand` color on `--code-bg`

---

## Spacing & Layout

- Base unit: `4px`
- Content max-width: `1200px` (marketing), `100%` (dashboard)
- Section padding: `80–120px` vertical, `24px` horizontal
- Card padding: `24px`
- Gap between cards: `16px`
- Use CSS Grid for layouts, Flexbox for alignment

```css
/* Grid layout pattern */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1px; /* with border trick for seamless grid */
  background: var(--border);
}
.grid-cards > * {
  background: var(--surface-1);
  padding: 24px;
}
```

---

## Borders & Radius

- Default border: `1px solid var(--border)`
- Border-radius:
  - Cards: `8px`
  - Buttons: `6px`
  - Inputs: `6px`
  - Badges: `4px`
  - Code blocks: `8px`
- **Never** use `border-radius > 12px` — avoid pill shapes except for small status badges

---

## Components

### Button — Primary
```css
.btn-primary {
  background: var(--brand);
  color: #000000;              /* black text on green */
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: var(--brand-hover);
}
```

### Button — Secondary / Ghost
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: border-color 0.15s, background 0.15s;
}
.btn-secondary:hover {
  background: var(--surface-2);
  border-color: var(--text-muted);
}
```

### Card
```css
.card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  transition: border-color 0.2s ease;
}
.card:hover {
  border-color: var(--border-strong);
}
```

### Input / Form field
```css
.input {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}
.input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px var(--brand-muted);
}
```

### Code Block
```css
.code-block {
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: 8px;
  padding: 16px 20px;
  font-family: 'Geist Mono', monospace;
  font-size: 13px;
  overflow-x: auto;
  color: var(--text-primary);
}
/* Syntax: keywords in green */
.token-keyword { color: var(--brand); }
.token-string   { color: #f1fa8c; }
.token-comment  { color: var(--text-muted); font-style: italic; }
```

### Badge / Status Pill
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}
.badge-green {
  background: var(--brand-muted);
  color: var(--brand);
  border: 1px solid #3ecf8e44;
}
```

### Navigation / Header
```css
.navbar {
  background: var(--background);
  border-bottom: 1px solid var(--border);
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}
```

---

## Iconography & Decorative Elements

- Use **Lucide** or **Heroicons** (outline style, stroke-width: 1.5)
- Icon color: `--text-muted` by default, `--brand` for active/highlighted states
- Icon size: 16px for inline, 20px for standalone, 24px for section headers

### Grid separator pattern (signature Supabase)
```css
/* Creates the iconic 1px border grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.feature-grid > * {
  padding: 32px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.feature-grid > *:nth-child(3n) { border-right: none; }
```

### Glow effect (subtle, brand-colored)
```css
.glow-green {
  box-shadow: 0 0 30px var(--brand-muted), 0 0 60px #3ecf8e11;
}
```

---

## Motion & Interactions

- Keep animations **fast and subtle**: `150–250ms`, `ease` or `ease-out`
- Hover: border color shift + very subtle background lightening
- Focus: green ring with `box-shadow: 0 0 0 2px var(--brand-muted)`
- No entrance animations on dashboards — only on marketing pages
- Marketing page: staggered `opacity: 0 → 1` with `translateY(10px) → 0`

---

## Do & Don't

| ✅ DO | ❌ DON'T |
|-------|----------|
| Dark background everywhere | White or light backgrounds |
| Green for primary actions | Purple, blue, or rainbow CTAs |
| 1px borders for structure | Thick borders or box shadows for depth |
| Monospace font for code | Code in sans-serif |
| Tight, precise spacing | Loose, airy "consumer app" spacing |
| Icons from Lucide/Heroicons | Custom decorative illustrations |
| Black text on green buttons | White text on green buttons |
| Subtle hover states | Dramatic hover transforms |
| Grid layouts with 1px dividers | Floating cards with big shadows |

---

## Quick Reference — Marketing Page Structure

```
[Navbar: logo + nav links + "Start for free" green CTA]

[Hero: 
  - Eyebrow label (badge: "Open source")
  - H1: large, tight tracking
  - Subtitle: --text-secondary, max-width 560px
  - 2 CTAs: green primary + ghost secondary
  - Code demo or dashboard screenshot below]

[Feature grid: 3-col with 1px borders]

[Social proof: logos on --surface-1 strip]

[Detailed feature section: alternating text + code block]

[Footer: dark, --surface-1, 4-col links grid]
```

---

## Example Variables Block (copy-paste ready)

```css
:root {
  --bg:           #0f0f0f;
  --surface:      #1c1c1c;
  --surface-2:    #2a2a2a;
  --border:       #2a2a2a;
  --border-hover: #3a3a3a;
  --brand:        #3ecf8e;
  --brand-dim:    #3ecf8e20;
  --text:         #ededed;
  --text-dim:     #a1a1a1;
  --text-muted:   #555555;
  --font-mono:    'Geist Mono', 'Fira Code', monospace;
  --radius:       8px;
  --radius-sm:    6px;
}
```