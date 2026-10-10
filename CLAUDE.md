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
- `style.css` (layout, print page chrome, grid classes like `.arithmetic-grid`, `.digital-root-check-grid`, `.dr-cell`) and `styles/skin.css` + `design-system/colors_and_type.css` (visual skin). Keep print media queries in mind — hiding controls/header in print is load-bearing.
- Print is squared paper (5mm cells). `ui/print-grid.js` `snapToCells()` runs after every render and wraps each glyph of a problem in `.gc` (one cell) / `.gw` (word box) / `.gs` (space) spans; `layoutForPrint()` runs on `beforeprint` and sets whole-cell column/row sizes. `styles/print-grid.css` (linked `media="print"`) owns everything inside `#problems-container` in print: reset margins/paddings, size every box in `var(--cell)` multiples, draw lines with `box-shadow`. A new topic's markup is picked up automatically if its problem grid uses `.arithmetic-grid`; for unusual layouts add rules there and run a print preview.

State persisted in `localStorage`: `lang`, `selectedTopic`, `expandedCategories`.

## Self-check convention

Every topic ships a self-check grid below the problems: a digital root (`utils.digitalRoot`) for arithmetic, or a topic-specific control sum for fractions/algebra (e.g. simplify-equations uses `digitalRoot(|a| + |b|)` of the canonical `ax + b`). Control sums must land in 0–9 — the tests assert this and the grid CSS assumes single-character cells.


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:1105d646 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
