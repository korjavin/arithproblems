# Replace Simplifying Equations Complexity Slider with Granular Controls

## Overview

Replace the single complexity slider in the Simplifying Equations section with individual controls matching the pattern used by other sections (linear-equations, mixed-operations). New controls: number of operations, include brackets checkbox, coefficient range, and nesting depth for brackets.

## Context

- Files involved:
  - `ui/controls.js` (renderSimplifyEquationsControls, lines 77-85)
  - `generators/simplify-equations.js` (generateTerm, generateExpression, generateSimplifyEquationsData)
  - `script.js` (renderSimplifyEquationsProblems, lines 598-617)
  - `locales/en.json` (simplify_equations translations, lines 392-399)
  - `locales/ru.json` (simplify_equations translations, lines 318-325)
  - `locales/de.json` (simplify_equations translations)
  - `test-simplify-equations.js` (tests)
- Related patterns: linear-equations controls (checkboxes, number inputs, selects), mixed-operations controls (num-operations, coefficient-range, allow-negative)
- Dependencies: none new

## Development Approach

- **Testing approach**: Regular (code first, then tests)
- Complete each task fully before moving to the next
- Follow the existing control ID naming convention: `se-` prefix
- **CRITICAL: every task MUST include new/updated tests**
- **CRITICAL: all tests must pass before starting next task**

## Implementation Steps

### Task 1: Update UI controls

**Files:**
- Modify: `ui/controls.js`

- [x] Replace `renderSimplifyEquationsControls` (lines 77-85) to render these controls instead of the slider:
  - Number input `se-num-operations` (min=2, max=6, default=2) - how many terms in the expression
  - Checkbox `se-include-brackets` (unchecked by default) - whether to include bracketed sub-expressions
  - Number input `se-bracket-depth` (min=1, max=3, default=1) - max nesting depth for brackets, shown only when brackets checkbox is checked
  - Number input `se-coefficient-range` (min=5, max=50, default=10) - max value for coefficients
- [x] Add event listener to toggle `se-bracket-depth` visibility based on `se-include-brackets` checked state (same pattern as `eq-variable-count` toggling controls in renderLinearEquationsControls)
- [x] Verify controls render correctly by running the app (manual - verified via tests)

### Task 2: Update generator to accept granular parameters

**Files:**
- Modify: `generators/simplify-equations.js`

- [x] Change `generateSimplifyEquationsData` signature from `{ complexity, numberOfProblems }` to `{ numOperations, includeBrackets, bracketDepth, coefficientRange, numberOfProblems }`
- [x] Update `generateTerm(complexity)` to accept `coefficientRange` instead of `complexity`, use `getRandomInt(1, coefficientRange)` for numeric terms and `getRandomInt(1, Math.max(1, Math.floor(coefficientRange / 2)))` for variable coefficients
- [x] Update `generateExpression(complexity, depth)` to accept `{ numOperations, includeBrackets, bracketDepth, coefficientRange }` and use `numOperations` for term count, only generate brackets when `includeBrackets` is true, and limit depth to `bracketDepth`
- [x] Remove the old complexity-based logic entirely
- [x] Write tests covering the new parameter combinations: no brackets, with brackets at various depths, different coefficient ranges, different operation counts
- [x] Run project test suite - must pass before task 3

### Task 3: Wire up UI controls to generator

**Files:**
- Modify: `script.js`

- [x] Update `renderSimplifyEquationsProblems` (lines 598-617) to read from new control IDs (`se-num-operations`, `se-include-brackets`, `se-coefficient-range`, `se-bracket-depth`) and pass them to the updated generator function
- [x] Write tests verifying the new controls are read correctly
- [x] Run project test suite - must pass before task 4

### Task 4: Update translations for all 3 locales

**Files:**
- Modify: `locales/en.json`
- Modify: `locales/ru.json`
- Modify: `locales/de.json`

- [ ] Add new translation keys under `simplify_equations` in the controls section for: `num_operations_label`, `include_brackets_label`, `bracket_depth_label`, `coefficient_range_label`
- [ ] Remove old `complexity_label` key from all locales
- [ ] Update `description` text in all locales to reflect the new controls
- [ ] Run project test suite - must pass before task 5

### Task 5: Verify acceptance criteria

- [ ] Run full test suite (`npm test`)
- [ ] Run linter if configured

### Task 6: Update documentation

- [ ] Update CLAUDE.md if internal patterns changed
- [ ] Move this plan to `docs/plans/completed/`
