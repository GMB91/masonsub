Mason Vector — UI Styleguide and Implementation Plan

Overview
--------
This document translates the design brief into a concrete implementation plan and Tailwind-friendly tokens and component rules. It's the single source of truth for the UI polish milestone.

Brand tokens
------------
- --color-brand: #00A9E0
- --color-white: #FFFFFF
- --color-bg: #F9FAFB
- --color-text: #1F2937
- --color-muted: #6B7280
- --color-border: #E5E7EB

Status palette
- success: emerald-500 / #10B981
- in-progress: brand blue (#00A9E0)
- review: amber-400 / #F59E0B
- pending: gray-300 / #D1D5DB
- critical: red-500 / #EF4444
- high: orange-500 / #F97316
- medium: yellow-400 / #FBBF24
- low: gray-400 / #9CA3AF

Typography
----------
- Font family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial
- Page title: 3xl / 30px / font-semibold / color: --color-text
- Section title: xl / 20px / font-semibold
- Body: base / 16px / font-normal / color: --color-muted
- Small labels: xs / 12px

Spacing & layout
- Base spacing: 4px steps
- Sidebar width: 288px (Tailwind w-72)
- Page padding: 32px (xx-large)
- Max page width: 1280px (centered container)

Components & rules
------------------
1) Sidebar (`src/components/layout/Sidebar.tsx`)
- Width w-72, white bg, right border --color-border
- Logo block: circular arrow SVG + 'MASON' (brand) 'VECTOR' (dark) + tagline
- Nav items: icon + label, padding (12px 16px), rounded 8px
- Active item: bg brand, text white, subtle shadow
- Hover: bg light gray
- Footer: settings button anchored bottom

2) Topbar (`src/components/layout/Topbar.tsx`)
- White background, bottom border --color-border
- Left: search field (max width 800px) with icon and focus ring in brand
- Right: notification bell + red dot, user profile with avatar colored in brand

3) Stats Card (`src/components/cards/StatCard.tsx`)
- Grid 4 columns desktop -> responsive
- Card: bg white, border, rounded-12, p-6
- Icon: 48px circle bg brand, icon white
- Value: 3xl font-bold
- Label: text-sm color muted
- Change: xs green text

4) Case Card (`src/components/cards/CaseCard.tsx`)
- Horizontal card with client, amount (brand), status badge (colored pill), priority badge on right
- Updated time small muted text
- Hover: elevate shadow and darker border

5) Recent Activity (`src/components/sidebar/RecentActivity.tsx`)
- List of activity items with avatar, bold user, action text, blue item link, amount, timestamp

Accessibility
- Focus rings for interactive elements: ring-2 with brand color
- Ensure contrast ratios meet WCAG AA for text
- Buttons and links should be reachable by keyboard and have aria-labels

Implementation Plan (first iteration)
1) Add `rebuild/UI_STYLEGUIDE.md` (this file).
2) Implement Sidebar design (update existing component) — action started.
3) Implement Topbar design.
4) Implement StatCard and grid layout on dashboard page.
5) Implement CaseCard and Active Cases container.
6) Implement RecentActivity component in sidebar area.
7) Add global Tailwind tokens (tailwind.config.cjs) adjustments if needed.
8) Run visual and accessibility checks; add unit tests for components.

Acceptance criteria (Iteration 1)
- Visual parity with spec for Sidebar, Topbar, Stats grid, Case list, Recent Activity on desktop.
- Responsive adjustments for tablet/mobile.
- No failing tests; basic accessibility checks (focus states, aria labels) in place.

Notes
- Use Lucide icons and Tailwind utilities.
- Keep components small and composable.
