# Math Worksheet Generator - Development Standards

This document describes the standards and conventions for adding new topics/sections to the Math Worksheet Generator application.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [Self-Checking Mechanisms](#self-checking-mechanisms)
4. [Translation/i18n Structure](#translationi18n-structure)
5. [Topic Organization Pattern](#topic-organization-pattern)
6. [Generator Pattern](#generator-pattern)
7. [UI Controls Pattern](#ui-controls-pattern)
8. [Problem Rendering Pattern](#problem-rendering-pattern)
9. [CSS Styling Patterns](#css-styling-patterns)
10. [Testing Pattern](#testing-pattern)
11. [Complete Checklist for Adding New Topics](#complete-checklist-for-adding-new-topics)

---

## Project Structure

```
/home/user/arithproblems/
├── generators/               # Problem generation logic
│   ├── simplify-equations.js
│   ├── linear-equations.js
│   └── [topic].js           # One file per topic
├── ui/
│   └── controls.js          # All UI control renderers
├── locales/                 # Translation files
│   ├── en.json
│   ├── de.json
│   └── ru.json
├── index.html               # Menu/navigation structure
├── script.js                # Main app logic & problem rendering
├── style.css                # Styling (grid layouts, containers)
├── i18n.js                  # i18n management
├── utils.js                 # Shared utilities (gcd, digitalRoot)
└── test-[topic].js          # Unit tests for each generator
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Generator files | `kebab-case` | `simplify-equations.js` |
| Topic IDs | `kebab-case` | `"simplify-equations"` |
| Translation keys | `snake_case` | `"simplify_equations"`, `"simplify_equations_h3"` |
| CSS classes | `kebab-case` | `simplify-equations-problem-grid`, `dr-cell` |
| Function names | `camelCase` | `renderSimplifyEquationsProblems()` |
| UI control IDs | `{prefix}-{param}` | `se-complexity`, `se-` prefix for simplify-equations |

---

## Self-Checking Mechanisms

### Digital Root (for arithmetic operations)
**Location:** `utils.js`

```javascript
export function digitalRoot(n) {
    let num = Math.abs(n);
    let sum = num;
    while (sum >= 10) {
        sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum;
}
```

**Used in:** Addition/Subtraction, Multiplication/Division, Linear Equations

### Control Sum (for algebraic/fraction operations)
Custom calculation per topic. Examples:
- **Simplify Equations**: Control sum = `digitalRoot(|a| + |b|)` where result is `ax + b`
- **Rational Canonical**: Sum based on fraction parts (for mixed numbers: `B+C`, proper fractions: `N+D`)

### Rendering Pattern
```javascript
html += `<div class="digital-root-check-grid-container">
    <h4>${t.control_sum_grid_title}</h4>
    <p style="font-size:0.85em; margin-bottom:10px;">${t.control_sum_grid_subtitle}</p>
    <div class="digital-root-check-grid">
        ${controlSums.map(a => `<div class="dr-cell">${a.controlSum}</div>`).join('')}
    </div>
</div>`;
```

---

## Translation/i18n Structure

### File Structure
Translations in `/locales/{en|de|ru}.json`

```json
{
    "title": "Math Worksheet Generator",
    "simplify_equations_h3": "Simplifying Equations",
    "simplify_equations_p": "Simplify algebraic expressions to standard form.",
    "category_algebra": "Algebra",
    "script": {
        "simplify_equations": {
            "complexity_label": "Complexity:",
            "description": "Simplify the algebraic expressions to the form ax + b",
            "problems_title": "Simplifying Equations",
            "control_sum_grid_title": "Control Sum Self-Check Grid",
            "control_sum_grid_subtitle": "Simplify to ax + b, then calculate |a| + |b| and find its digital root",
            "error_message": "Error generating simplification problems. Please try again."
        }
    }
}
```

### Translation Key Patterns
- **Menu label:** `{topic_id}_h3`
- **Menu description:** `{topic_id}_p`
- **Script translations:** Under `script.{topic_id}` with standard keys:
  - `complexity_label`, `description` (controls)
  - `problems_title` (problem header)
  - `control_sum_grid_title`, `control_sum_grid_subtitle` (self-check)
  - `error_message` (error handling)
  - Custom parameters: `{param}_label`

---

## Topic Organization Pattern

### HTML Menu Structure (`index.html`)
```html
<div class="topic-category" data-category="algebra">
    <div class="category-header">
        <span class="category-toggle">▶</span>
        <span class="category-name" data-translate-key="category_algebra">Algebra</span>
    </div>
    <ul class="topic-list">
        <li class="topic-item" data-topic="simplify-equations">
            <span data-translate-key="simplify_equations_h3">Simplifying Equations</span>
        </li>
    </ul>
</div>
```

**Standard Categories:**
- `basic-arithmetic`
- `fractions`
- `percentages`
- `geometry`
- `algebra`
- `word-problems`

### Registration in `script.js`
Topics must be registered in **three locations**:

```javascript
// 1. Import Statement (top of file)
import { generateSimplifyEquationsData } from './generators/simplify-equations.js';
import * as controls from './ui/controls.js';

// 2. Control Renderers Map
const topicControlsRenderers = {
    "simplify-equations": controls.renderSimplifyEquationsControls,
};

// 3. Problem Renderers Map
const problemRenderers = {
    "simplify-equations": renderSimplifyEquationsProblems,
};
```

---

## Generator Pattern

### File: `generators/{topic}.js`

```javascript
import { digitalRoot } from '../utils.js';

/**
 * Generate problems for {topic}
 * @param {Object} params - Generation parameters
 * @param {number} params.complexity - Complexity level (1-5)
 * @param {number} params.numberOfProblems - Number of problems to generate
 * @returns {Object} - { problems: Array, controlSums: Array }
 */
export function generate{Topic}Data({ complexity, numberOfProblems }) {
    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        // Generate problem based on complexity
        const problem = {
            expression: "...",  // Problem to display
            // ... other display data
        };
        problems.push(problem);

        // Calculate control sum for self-checking
        const controlSum = calculateControlSum(problem);
        controlSums.push({ controlSum });
    }

    return { problems, controlSums };
}

function calculateControlSum(problem) {
    // Custom logic per topic
    // Often uses digitalRoot() from utils.js
    return digitalRoot(someValue);
}
```

**Key Points:**
- Export function named `generate{Topic}Data`
- Accept object parameter with `complexity` and `numberOfProblems`
- Return object with parallel arrays: `{ problems, controlSums }`
- Validate input parameters and throw descriptive errors
- Use `digitalRoot()` from utils.js for consistency

---

## UI Controls Pattern

### File: `ui/controls.js`

```javascript
/**
 * Render controls for {topic}
 * @param {HTMLElement} container - Container element
 * @param {Object} t - Translations object from script.{topic_id}
 */
export function render{Topic}Controls(container, t) {
    container.innerHTML = `
        <div>
            <label for="{prefix}-complexity">${t.complexity_label}</label>
            <input type="range" id="{prefix}-complexity" value="1" min="1" max="5">
            <span id="{prefix}-complexity-value">1</span>
        </div>
        <div>
            <label for="{prefix}-param">${t.param_label}</label>
            <input type="number" id="{prefix}-param" value="10" min="1" max="100">
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;

    // Optional: Add event listeners for dynamic updates
    const complexitySlider = document.getElementById('{prefix}-complexity');
    const complexityValue = document.getElementById('{prefix}-complexity-value');
    complexitySlider.addEventListener('input', () => {
        complexityValue.textContent = complexitySlider.value;
    });
}
```

**Standard Control Types:**
- Range sliders: `<input type="range" id="{prefix}-{param}" value="1" min="1" max="5">`
- Number inputs: `<input type="number" id="{prefix}-{param}" value="10">`
- Checkboxes: `<input type="checkbox" id="{prefix}-{param}" checked>`
- Labels: Use translation keys from `t.{param}_label`

---

## Problem Rendering Pattern

### File: `script.js`

```javascript
function render{Topic}Problems(translations) {
    try {
        // 1. Get translations
        const t = translations.script.{topic_id};

        // 2. Read UI control values
        const complexity = parseInt(document.getElementById('{prefix}-complexity').value, 10);
        const numberOfProblems = parseInt(DOM.numProblemsInput.value, 10);

        // 3. Validate inputs (optional)
        if (!complexity || !numberOfProblems) {
            throw new Error('Invalid parameters');
        }

        // 4. Generate problems
        const { problems, controlSums } = generate{Topic}Data({
            complexity,
            numberOfProblems
        });

        // 5. Build HTML with grid layout
        let html = `<h3>${t.problems_title}</h3>`;
        html += `<div class="arithmetic-grid {topic}-problem-grid">`;
        html += problems.map(p =>
            `<div class="{topic}-item">
                <div class="problem-content">
                    <span class="equation">${p.expression} = </span>
                    <div class="answer-space"></div>
                </div>
            </div>`
        ).join('');
        html += `</div>`;

        // 6. Add self-check grid
        if (controlSums.length > 0) {
            html += `<div class="digital-root-check-grid-container">
                <h4>${t.control_sum_grid_title}</h4>
                <p style="font-size:0.85em; margin-bottom:10px;">
                    ${t.control_sum_grid_subtitle}
                </p>
                <div class="digital-root-check-grid">
                    ${controlSums.map(a => `<div class="dr-cell">${a.controlSum}</div>`).join('')}
                </div>
            </div>`;
        }

        // 7. Render to DOM
        DOM.problemsContainer.innerHTML = html;

    } catch (error) {
        console.error('Error:', error);
        DOM.problemsContainer.innerHTML = `<p style="color:red;">${t.error_message}</p>`;
    }
}
```

---

## CSS Styling Patterns

### Standard Classes

| Class | Purpose |
|-------|---------|
| `.arithmetic-grid` | Problem grid container (display: grid, auto-fill columns) |
| `.{topic}-problem-grid` | Topic-specific grid variant (add to .arithmetic-grid) |
| `.{topic}-item` | Individual problem wrapper |
| `.problem-content` | Contains problem + answer space |
| `.answer-space` | Empty div for student answers |
| `.dr-cell` | Digital root self-check cell |
| `.digital-root-check-grid-container` | Self-check container wrapper |
| `.digital-root-check-grid` | Grid for control sum display |

### Grid Responsive Design
```css
#problems-container .arithmetic-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 30px 25px;
    align-items: start;
    padding-top: 15px;
}

.digital-root-check-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px 25px;
    justify-items: center;
}
```

---

## Testing Pattern

### File: `test-{topic}.js`

```javascript
import { generate{Topic}Data } from './generators/{topic}.js';
import assert from 'assert';

function testGenerate{Topic}Data() {
    console.log('Testing generate{Topic}Data...');

    // Test basic generation
    const result = generate{Topic}Data({ complexity: 1, numberOfProblems: 5 });
    assert.strictEqual(result.problems.length, 5, 'Should generate 5 problems');
    assert.strictEqual(result.controlSums.length, 5, 'Should generate 5 control sums');

    // Test structure
    assert(Array.isArray(result.problems), 'Problems should be an array');
    assert(Array.isArray(result.controlSums), 'Control sums should be an array');

    // Test problem structure
    result.problems.forEach((problem, i) => {
        assert(problem.expression, `Problem ${i} should have expression`);
        // ... other assertions
    });

    // Test control sums
    result.controlSums.forEach((cs, i) => {
        assert(typeof cs.controlSum === 'number', `Control sum ${i} should be a number`);
        assert(cs.controlSum >= 0 && cs.controlSum <= 9, `Control sum ${i} should be 0-9`);
    });

    console.log('✓ All generate{Topic}Data tests passed');
}

testGenerate{Topic}Data();
```

### Update `package.json`
```json
"scripts": {
    "test": "node test-utils.js && ... && node test-{topic}.js"
}
```

---

## Complete Checklist for Adding New Topics

### 1. Generator (`generators/{topic}.js`)
- [ ] Create generator file with naming convention
- [ ] Export `generate{Topic}Data` function
- [ ] Accept `{ complexity, numberOfProblems }` parameters
- [ ] Return `{ problems, controlSums }` object
- [ ] Implement control sum calculation
- [ ] Add input validation and error handling

### 2. Test File (`test-{topic}.js`)
- [ ] Create test file
- [ ] Test basic generation with different parameters
- [ ] Test array structure and lengths
- [ ] Test problem object structure
- [ ] Test control sum calculations (0-9 range)
- [ ] Add to `package.json` test script

### 3. UI Controls (`ui/controls.js`)
- [ ] Add `render{Topic}Controls` function
- [ ] Use consistent ID prefixes for controls
- [ ] Add all necessary controls (complexity, parameters)
- [ ] Use translation keys for labels
- [ ] Add event listeners if needed
- [ ] Include description paragraph

### 4. Main Script (`script.js`)
- [ ] Import generator function at top
- [ ] Add to `topicControlsRenderers` map
- [ ] Add to `problemRenderers` map
- [ ] Create `render{Topic}Problems` function
- [ ] Read control values
- [ ] Generate problems
- [ ] Build HTML with grid layout
- [ ] Add self-check grid
- [ ] Wrap in try-catch with error handling

### 5. HTML Menu (`index.html`)
- [ ] Add topic item to appropriate category
- [ ] Use `data-topic="{topic-id}"` attribute
- [ ] Add `data-translate-key="{topic_id}_h3"` to span
- [ ] Provide default English text in span

### 6. Translations (`locales/*.json`)
For each language file (en.json, de.json, ru.json):
- [ ] Add `{topic_id}_h3` (menu label)
- [ ] Add `{topic_id}_p` (menu description)
- [ ] Add `script.{topic_id}` section with:
  - [ ] `complexity_label`
  - [ ] `description`
  - [ ] `problems_title`
  - [ ] `control_sum_grid_title`
  - [ ] `control_sum_grid_subtitle`
  - [ ] `error_message`
  - [ ] Any custom parameter labels

### 7. CSS Styling (`style.css`) - Optional
- [ ] Add topic-specific grid styling if needed
- [ ] Use standard classes when possible
- [ ] Ensure responsive design

### 8. Testing & Verification
- [ ] Run `npm test` to verify tests pass
- [ ] Test in browser with all complexity levels
- [ ] Verify control sums are correct
- [ ] Test in all three languages (en, de, ru)
- [ ] Test responsive layout on different screen sizes
- [ ] Verify print layout looks correct

---

## Data Flow Diagram

```
User selects topic → HTML data-topic attribute
                    ↓
         handleTopicChange() triggered
                    ↓
         Control renderer called from topicControlsRenderers map
                    ↓
         User sets controls (UI range/inputs)
                    ↓
         User clicks "Generate Worksheet"
                    ↓
         handleGenerateClick() → looks up problemRenderers[currentTopic]
                    ↓
         render{Topic}Problems(translations) called
                    ↓
         Reads UI values (document.getElementById('{prefix}-{param}').value)
                    ↓
         Calls generate{Topic}Data(params)
                    ↓
         Generator returns { problems, controlSums }
                    ↓
         Builds HTML with grid layout + self-check grid
                    ↓
         Renders HTML to DOM.problemsContainer
```

---

## Key Principles

1. **Modularity:** Each topic is self-contained with its own generator, controls, renderer, and tests
2. **Consistency:** Follow naming conventions and patterns across all topics
3. **Reusability:** Use shared utilities (gcd, digitalRoot) and CSS classes
4. **Accessibility:** Full translation support for all UI text
5. **Error Handling:** Validate inputs and provide user-friendly error messages
6. **Testing:** Always include unit tests for generators
7. **Self-Checking:** Provide control sums/digital roots for student verification
8. **Responsive Design:** Use grid layouts that adapt to different screen sizes

---

## Common Pitfalls to Avoid

1. ❌ Forgetting to register topic in all three maps in `script.js`
2. ❌ Inconsistent naming between topic ID, translation keys, and function names
3. ❌ Not providing translations in all three language files
4. ❌ Missing translation keys in `script.{topic_id}` section
5. ❌ Not adding test file to `package.json` test script
6. ❌ Using different control ID prefixes within same topic
7. ❌ Forgetting to add `data-translate-key` to menu items
8. ❌ Not wrapping renderer in try-catch error handling
9. ❌ Returning inconsistent data structure from generator
10. ❌ Not validating control sum range (should be 0-9 for digital roots)

---

## Example: Quick Reference for "Simplify Equations"

| File | Key Content |
|------|-------------|
| `generators/simplify-equations.js` | `export function generateSimplifyEquationsData({...})` |
| `test-simplify-equations.js` | `testGenerateSimplifyEquationsData()` |
| `ui/controls.js` | `export function renderSimplifyEquationsControls(container, t)` |
| `script.js` | `import { generateSimplifyEquationsData }` + 2 map entries + renderer |
| `index.html` | `<li class="topic-item" data-topic="simplify-equations">` |
| `locales/en.json` | `simplify_equations_h3`, `script.simplify_equations.*` |
| Control IDs | `se-complexity` (prefix: `se-`) |

---

This standards document should be updated whenever new patterns or conventions are established in the codebase.
