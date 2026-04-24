# Visual Reskin: German Conjunctions Trainer DS on index.html

## Overview
- Reskin the Math Worksheet Generator with the German Conjunctions Trainer's visual language (warm orange on cream, Nunito Sans, glassmorphic cards, warm shadows, animated breathing background).
- User constraints from the design chat: "we don't change UX and user flow, we change visual design" and "we shouldn't change print form at all". Print CSS must stay byte-identical.
- Source: `claude.ai/design` handoff bundle extracted at `/tmp/anthropic-design/math-problem-exercises/`.

## Context (from discovery)
- Files/components involved:
  - `index.html` — markup to update (header brand, panel wrappers, button variants, empty state)
  - `style.css` — left untouched to preserve print CSS (1611 lines)
  - `design-system/colors_and_type.css` — new, design tokens
  - `styles/skin.css` — new, cascades over `style.css` for the visual reskin
  - `script.js` — tiny additions (language flag `.active`, topic-badge sync, G hotkey, hide empty state)
  - `locales/{en,de,ru}.json` — add strings for tagline/proverb/empty-state
- Related patterns found:
  - i18n uses `data-translate-key` + dotted keys (e.g. `script.topic.x`)
  - topic selection click is handled in `script.js`; `#topic-badge` needs updating there
  - language switcher uses event delegation on `#language-switcher` with `data-lang`
- Dependencies identified:
  - Vendor ES modules imported via importmap — unchanged
  - Print columns rely on `--print-cols` CSS var set from JS — unchanged

## Development Approach
- **Testing approach**: Regular (code first, then tests). Visual reskin is structural/CSS; unit tests cover generator math which is unchanged.
- Additive by default: don't edit `style.css` (preserves print CSS guaranteed). New CSS files cascade on top.
- Update this plan file when scope changes during implementation.
- Maintain backward compatibility of JS behavior.

## Testing Strategy
- **Unit tests**: run existing suite (`./test.sh` or `npm test`) — they exercise generator math; must still pass after changes.
- **E2E**: project has headless test helpers (`jules-scratch/verification/verify.py`) but they're visual. Skip unless user asks.
- Manual verification is Post-Completion (can't automate design review here).

## Progress Tracking
- Mark completed items `[x]` immediately as finished.

## Implementation Steps

### Task 1: Add design-system tokens
- [x] create `design-system/colors_and_type.css` with tokens (orange scale, cream scale, text scale, typography, spacing, radii, shadows, transitions, Nunito Sans import)

### Task 2: Create skin layer
- [x] create `styles/skin.css` with the visual reskin (body background, header, language switcher, app-container, topic-sidebar, category/topic items, panels, controls, buttons with hotkeys, problems-empty proverb state, worksheet-header, self-check container)
- [x] do NOT include any `@media print` rules in skin.css (print belongs to style.css)

### Task 3: Update `index.html`
- [x] link `design-system/colors_and_type.css` and `styles/skin.css` (in that order, AFTER `style.css` so the skin wins the cascade)
- [x] add `.header-brand` wrapper with `∑` `.brand-mark` and `.tagline` under the h1
- [x] add `role="tablist"` to `#language-switcher`; mark the initially-active flag with `.active` (script.js will maintain)
- [x] wrap `#controls-panel` inner with `.panel` structure including `.panel-title` + `#topic-badge`
- [x] replace `.button` with `.button-primary` (Generate) and `.button-secondary` (Print); add `.hotkey` chips (G, ⌘P)
- [x] add `.problems-empty` default state (proverb + english proverb + hint-text) inside `#problems-container`

### Task 4: Minimal `script.js` adjustments
- [x] on language-flag click, set `.active` on the clicked flag (remove from others)
- [x] on initial language load, set `.active` on the matching flag
- [x] on topic change, update `#topic-badge` text to the current topic label
- [x] add `g`/`G` keyboard shortcut that clicks the generate button (ignore if typing in input)
- [x] when generate runs, ensure `.problems-empty` is replaced by the generated content (already works — innerHTML overwrite)

### Task 5: i18n additions
- [x] add `tagline`, `proverb_en`, `empty_hint` keys to `locales/en.json`, `de.json`, `ru.json`
- [x] translate idiomatically (EN: "Practice makes perfect" · DE: "Übung macht den Meister" — reused as decorative proverb per design · RU: short equivalent hint)

### Task 6: Verify acceptance criteria
- [x] diff `style.css` — it must be byte-identical to pre-change
- [x] run `./test.sh` or `npm test`; all must pass
- [x] visual hand-off: index.html loads design-system + skin + style.css in correct order

*Note: ralphex automatically moves completed plans to `docs/plans/completed/`.*

## Technical Details
- **Cascade order in `<head>`**: `style.css` → `design-system/colors_and_type.css` → `styles/skin.css`. This lets skin.css override old rules using either matching specificity or token variables.
- **No print changes**: skin.css contains zero `@media print` blocks. style.css prints as before.
- **Brand-mark symbol**: `∑` (unicode U+2211), sized via `.brand-mark` rule in skin.css.
- **Hotkey chip content**: visual only (`G`, `⌘P`). Actual keybinds are JS handlers.
- **`.active` on language flag**: CSS rule already in design app.css; just needs JS to toggle the class.

## Post-Completion
- Manual verification:
  - open index.html in a browser, step through each topic, ensure controls render and Generate populates problems
  - Print preview (⌘P) must show original black-on-white graph-paper layout — no regressions
  - Language switching (EN/DE/RU) must still translate all strings; new keys should display
- External: none (static client app, no backend).
