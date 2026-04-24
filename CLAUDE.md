# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static, zero-backend math worksheet generator. Pure ES modules served as-is by Nginx in production — there is no bundler or build step for the app itself. `mathjs` is the only runtime dependency and is vendored under `vendor/` and wired through an `importmap` in `index.html`, so browser imports like `from 'mathjs'` resolve without npm.

## Commands

- `npm test` — runs every `test-*.js` file sequentially with `node` (see the long chain in `package.json`). When adding a new topic, append its test file to that chain or CI will not run it.
- `node test-<topic>.js` — run a single topic's test file directly.
- `./test.sh` — starts `python3 -m http.server 8001` and opens the browser; use this (or any static server) to exercise the UI. There is no dev server built in.
- `docker build -t arithproblems .` → `docker run -p 8080:80 arithproblems` — production image (Nginx serving the repo root). CI publishes to `ghcr.io/korjavin/arithproblems` via `.github/workflows/deploy.yml`.

## Architecture

The app follows a strict per-topic pattern. Every topic is a tuple of files connected through three registries in `script.js`. **`STANDARDS.md` is the source of truth for the pattern** (naming conventions, translation key layout, checklist for adding a topic); read it before adding or renaming a topic.

Per-topic files:
- `generators/<topic>.js` — exports `generate<Topic>Data({ ...params })` returning `{ problems, controlSums }` (or `{ problems, answerRoots }` / `digitalRoots` for older topics — shape is topic-specific, but the renderer in `script.js` must agree).
- `ui/controls.js` — one `render<Topic>Controls(container, t)` function per topic. All controls live in this single file, not split per topic. Uses a short ID prefix per topic (e.g. `mt-`, `as-`, `md-`, `se-`).
- `script.js` — one `render<Topic>Problems(translations)` function per topic, reads DOM control values by ID, calls the generator, builds HTML (including a self-check grid), writes to `DOM.problemsContainer`.
- `test-<topic>.js` — node-executable, asserts on generator output shape and value ranges.

The three registries in `script.js` that must all be updated together:
1. `import { generate<Topic>Data } from './generators/<topic>.js'` at the top.
2. `topicControlsRenderers` map: topic-id → control renderer.
3. `problemRenderers` map: topic-id → problem renderer.

Topic IDs use `kebab-case` in HTML `data-topic` attributes and registry keys, but translation keys use `snake_case` — `script.js` converts between them via `currentTopic.replace(/-/g, '_')` when looking up `translations.script[topicKey]`. Mismatches here are the most common bug when adding a topic.

Note the one aliasing case: topic-id `linear-equations` maps to `generators/linear-equations-n-vars.js` (`generateLinearEquationsNVarsData`). The older `linear-equations.js` and `linear-equations-two-vars.js` generators exist but are not wired into the UI registries.

Shared infrastructure:
- `utils.js` — `gcd`, `digitalRoot`, `getRandomInt` (crypto-backed with `Math.random` fallback), `getRandomNumberByDigits`, `getRandomFromArray`, `shuffleArray`. Prefer these over re-rolling randomness.
- `i18n.js` — loads `locales/{en,de,ru}.json` by `fetch`, caches translations, applies them to any element with `data-translate-key`. `setLanguage` accepts an `onLanguageChange` callback which `script.js` uses to re-render the active topic's controls in the new language.
- `locales/*.json` — all three must be updated for any new UI string. Menu entries use keys `<topic_id>_h3` / `<topic_id>_p`; per-topic script strings live under `script.<topic_id>.*` with standard keys (`problems_title`, `control_sum_grid_title`, `control_sum_grid_subtitle`, `error_message`, plus per-control `*_label`).
- `index.html` — menu is a static tree of `.topic-category` → `.topic-item[data-topic=...]`. Categories: `basic-arithmetic`, `fractions`, `percentages`, `geometry`, `algebra`, `word-problems`.
- `style.css` (layout, print styles, grid classes like `.arithmetic-grid`, `.digital-root-check-grid`, `.dr-cell`) and `styles/skin.css` + `design-system/colors_and_type.css` (visual skin). Keep print media queries in mind — hiding controls/header in print is load-bearing.

State persisted in `localStorage`: `lang`, `selectedTopic`, `expandedCategories`.

## Self-check convention

Every topic ships a self-check grid below the problems: a digital root (`utils.digitalRoot`) for arithmetic, or a topic-specific control sum for fractions/algebra (e.g. simplify-equations uses `digitalRoot(|a| + |b|)` of the canonical `ax + b`). Control sums must land in 0–9 — the tests assert this and the grid CSS assumes single-character cells.
