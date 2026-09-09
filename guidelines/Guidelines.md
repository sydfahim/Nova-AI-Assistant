# Nova — Design Guidelines

## Aesthetic stance: Precision-Minimal OS

Nova is not a chatbot. It is a personal AI operating system — precision-built, capable, and deliberately calm. The design prioritizes function over decoration, breathing room over density, and craft over convention.

Avoid: gradients, rounded pill buttons, card shadows with colored glows, emoji-heavy onboarding. Lean toward: surgical whitespace, hairline borders, disciplined typography.

---

## Typography

| Role | Family | Weight | Notes |
|------|--------|--------|-------|
| UI / body | Plus Jakarta Sans | 400–600 | Primary face. Clean geometric humanist. |
| Code / mono labels | JetBrains Mono | 400–500 | Code blocks, timestamps, language labels. |

- Heading tracking: `-0.025em`
- Body line-height: `1.72`
- Code font-size: `0.82–0.85rem`

---

## Color tokens

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--background` | `oklch(0.090 0.012 264)` | `oklch(0.972 0.006 264)` | Page ground |
| `--foreground` | `oklch(0.920 0.010 264)` | `oklch(0.100 0.012 264)` | Primary text |
| `--sidebar` | `oklch(0.107 0.012 264)` | `oklch(0.940 0.008 264)` | Sidebar ground |
| `--surface` | `oklch(0.130 0.012 264)` | `oklch(1.000 0.000 0)` | Card / input backgrounds |
| `--border-color` | `oklch(1 0 0 / 0.072)` | `oklch(0 0 0 / 0.080)` | Hairline borders |
| `--muted-foreground` | `oklch(0.470 0.020 264)` | `oklch(0.530 0.020 264)` | Secondary labels |
| `--accent` | `oklch(0.605 0.215 264)` | `oklch(0.545 0.215 264)` | Interactive accent (indigo) |
| `--user-bubble` | `oklch(0.145 0.030 264)` | `oklch(0.885 0.025 264)` | User message background |

Accent hue 264 lands between blue and violet — precise without being playful.

---

## Layout

- Sidebar: 260px fixed, collapsible
- Chat content: `max-w-3xl` centered within the main area
- Message spacing: `space-y-6` between turns
- Input: fixed to bottom, `max-w-3xl` centered, `rounded-2xl` floating card

---

## Component patterns

### Messages
- **User**: right-aligned, `--user-bubble` background, `rounded-2xl rounded-tr-sm`
- **Assistant**: left-aligned full-width prose, preceded by accent-color avatar

### Code blocks
- Header bar with language label + copy button
- `vscDarkPlus` in dark, `oneLight` in light
- Line numbers shown when `> 6 lines`

### Streaming cursor
- `.streaming-cursor::after` — blinking `▋` in accent color
- 0.9s step animation

---

## Architecture notes

- `/api/chat` is handled by the Vite `novaApiPlugin` middleware (server-only)
- `OPENAI_API_KEY` is read from `process.env` — never bundled into client code
- Conversations persisted in `localStorage` (`nova-conversations`)
- Sidebar state persisted (`nova-sidebar`)
- Theme persisted (`nova-theme`), dark by default
- Future extensibility: add tools/memory/agents as hooks alongside `useChat`
