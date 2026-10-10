import assert from 'assert';
import fs from 'fs';
import { generateGridFiguresData, perimeter, cornerCount, isSimple, gluedCells, TYPES, SIZES } from './generators/grid-figures.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.grid_figures]));
const gen = (types, opts = {}) => generateGridFiguresData({ types, size: 6, numberOfProblems: 20, translations: LOCALES.en, ...opts });
const key = (x, y) => `${x},${y}`;
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// Independent checks.
function connected(cells) {
    const s = new Set(cells.map(([x, y]) => key(x, y)));
    const seen = new Set([key(...cells[0])]);
    const stack = [cells[0]];
    while (stack.length) {
        const [x, y] = stack.pop();
        DIRS.forEach(([dx, dy]) => { const k = key(x + dx, y + dy); if (s.has(k) && !seen.has(k)) { seen.add(k); stack.push([x + dx, y + dy]); } });
    }
    return seen.size === cells.length;
}
const edgeCount = (cells) => {
    const s = new Set(cells.map(([x, y]) => key(x, y)));
    let n = 0;
    cells.forEach(([x, y]) => DIRS.forEach(([dx, dy]) => { if (!s.has(key(x + dx, y + dy))) n++; }));
    return n;
};
// Walk the outline as directed edges (figure on the left) and count turns.
function walkCorners(cells) {
    const s = new Set(cells.map(([x, y]) => key(x, y)));
    const next = new Map();
    cells.forEach(([x, y]) => {
        if (!s.has(key(x, y - 1))) next.set(key(x + 1, y), [x, y]);         // top edge, right → left
        if (!s.has(key(x - 1, y))) next.set(key(x, y), [x, y + 1]);         // left edge, top → bottom
        if (!s.has(key(x, y + 1))) next.set(key(x, y + 1), [x + 1, y + 1]); // bottom edge, left → right
        if (!s.has(key(x + 1, y))) next.set(key(x + 1, y + 1), [x + 1, y]); // right edge, bottom → top
    });
    const start = next.keys().next().value;
    let at = start.split(',').map(Number), dir = null, firstDir = null, turns = 0, steps = 0;
    do {
        const to = next.get(key(...at));
        const d = key(to[0] - at[0], to[1] - at[1]);
        if (dir === null) firstDir = d; else if (d !== dir) turns++;
        dir = d; at = to; steps++;
    } while (key(...at) !== start);
    if (dir !== firstDir) turns++;
    assert.strictEqual(steps, next.size, 'outline is a single loop');
    return turns;
}

// Hand-checked shapes.
const L = [[0, 0], [0, 1], [0, 2], [1, 2]];
assert.strictEqual(perimeter(L), 10);
assert.strictEqual(cornerCount(L), 6);
assert.strictEqual(walkCorners(L), 6);
const plus = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]];
assert.strictEqual(perimeter(plus), 12);
assert.strictEqual(cornerCount(plus), 12);
assert.strictEqual(isSimple([[0, 0], [1, 1], [0, 1]]), true);
assert.strictEqual(isSimple([[0, 0], [1, 1]]), false, 'pinch');
const ring = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
assert.strictEqual(isSimple(ring), false, 'hole');
// Glued squares 2, 3, 4 in a row: 2·9 + 2 + 4 + (3−2) + (4−3) = 26; L of 5 with 3 right and 2 on top: 2·(8 + 7) = 30.
assert.strictEqual(perimeter(gluedCells('row', [2, 3, 4]).flat()), 26);
assert.strictEqual(perimeter(gluedCells('L', [5, 3, 2]).flat()), 30);

for (const lang of ['en', 'de', 'ru']) {
    for (const size of SIZES) {
        for (const allowHalves of [false, true]) {
            const { problems, controlSums } = gen(TYPES, { size, allowHalves, translations: LOCALES[lang] });
            assert.strictEqual(problems.length, 20);
            assert.strictEqual(controlSums.length, 20);
            problems.forEach((p, i) => {
                assert.ok(p.text && !/[{}]/.test(p.text), `filled text: ${p.text}`);
                assert.ok(p.svg.startsWith('<svg') && !/NaN|undefined/.test(p.svg), 'svg');
                assert.ok(Number.isInteger(controlSums[i].controlSum) && controlSums[i].controlSum >= 0 && controlSums[i].controlSum <= 9);
                assert.strictEqual(controlSums[i].controlSum, p.controlSum);
                const figs = p.figures || (p.cells ? [p.cells] : []);
                figs.forEach(f => {
                    assert.ok(connected(f), 'connected');
                    if (p.type !== 'glued' && p.type !== 'staircase') {
                        assert.ok(isSimple(f));
                        assert.ok(f.every(([x, y]) => x >= 0 && y >= 0 && x < size && y < size), 'inside the field');
                    }
                });
                switch (p.type) {
                    case 'perimeter': assert.strictEqual(p.answer, edgeCount(p.cells)); break;
                    case 'corners': assert.strictEqual(p.answer, walkCorners(p.cells)); break;
                    case 'area':
                        assert.strictEqual(p.answer, p.cells.length + p.halves.length / 2);
                        assert.strictEqual(p.controlSum, digitalRoot(p.halves.length ? 2 * p.answer : p.answer));
                        if (!allowHalves) assert.strictEqual(p.halves.length, 0);
                        break;
                    case 'staircase': {
                        const { k, W, H } = p.data;
                        assert.strictEqual(W, k * p.stepWidth);
                        assert.strictEqual(H, k * p.stepHeight);
                        assert.strictEqual(edgeCount(p.cells) > 0, true);
                        assert.strictEqual(p.answer, p.variant === 'staircase_step' ? H / k : 2 * (W + H));
                        break;
                    }
                    case 'glued': {
                        assert.strictEqual(new Set(p.sides).size, p.sides.length, 'different sides');
                        assert.strictEqual(p.cells.length, p.sides.reduce((a, s) => a + s * s, 0), 'squares do not overlap');
                        assert.strictEqual(new Set(p.cells.map(c => key(...c))).size, p.cells.length);
                        const known = p.sides.filter((_, i) => i !== p.missing).reduce((a, b) => a + b, 0);
                        // The missing side follows from the given extent.
                        const derived = p.layout === 'L' ? p.extent.l - p.sides[0] : p.extent.l - known;
                        assert.strictEqual(derived, p.sides[p.missing]);
                        if (p.variant === 'glued_side') assert.strictEqual(p.answer, p.sides[p.missing]);
                        else assert.strictEqual(p.answer, edgeCount(p.cells));
                        break;
                    }
                    case 'compare': {
                        const values = p.figures.map(f => (p.measure === 'area' ? f.length : edgeCount(f)));
                        const best = Math.max(...values);
                        assert.strictEqual(values.filter(v => v === best).length, 1, 'unique largest');
                        assert.strictEqual(p.answer, values.indexOf(best) + 1);
                        assert.ok(p.answer >= 1 && p.answer <= 3);
                        break;
                    }
                    default: assert.fail(`unknown type ${p.type}`);
                }
            });
        }
    }
}

// Every variant shows up.
const seen = new Set();
for (let i = 0; i < 20; i++) gen(TYPES, { allowHalves: true }).problems.forEach(p => seen.add(p.variant + (p.layout ? `/${p.layout}` : '')));
['perimeter', 'area_halves', 'corners', 'staircase_perimeter', 'staircase_step', 'glued_side/row', 'glued_side/L', 'glued_perimeter/row', 'glued_perimeter/L', 'compare_area', 'compare_perimeter']
    .forEach(v => assert.ok(seen.has(v), `variant ${v}`));

assert.throws(() => gen([]), /type/);
assert.throws(() => gen(TYPES, { size: 3 }), /size/);
assert.throws(() => gen(TYPES, { numberOfProblems: 0 }), /number/);

console.log('All grid-figures tests passed!');
