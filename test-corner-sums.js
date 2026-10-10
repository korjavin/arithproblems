import assert from 'assert';
import fs from 'fs';
import { generateCornerSumsData, FIGURES, NUMBER_SETS, HIDDEN } from './generators/corner-sums.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.corner_sums]));
const gen = (opts = {}) => generateCornerSumsData({ figure: 'row', numberSet: '8', hidden: 'few', numberOfProblems: 9, translations: LOCALES.en, ...opts });

function permutations(arr, k) {
    if (k === 0) return [[]];
    return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)], k - 1).map(rest => [x, ...rest]));
}

// Independent brute force: every arrangement of the unused numbers over the hidden circles.
function solutions(p) {
    const hidden = p.circles.map((c, i) => (c.hidden ? i : -1)).filter(i => i >= 0);
    const shown = new Set(p.circles.filter(c => !c.hidden).map(c => c.value));
    const pool = Array.from({ length: p.n }, (_, i) => i + 1).filter(v => !shown.has(v));
    return permutations(pool, hidden.length).filter(perm => {
        const v = p.circles.map(c => c.value);
        hidden.forEach((i, j) => { v[i] = perm[j]; });
        return p.groups.every(g => g.ids.reduce((s, i) => s + v[i], 0) === g.sum);
    }).length;
}

function check(p, hiddenMode) {
    const values = p.circles.map(c => c.value);
    assert.strictEqual(new Set(values).size, values.length, 'numbers distinct');
    assert.ok(values.every(v => Number.isInteger(v) && v >= 1 && v <= p.n), 'numbers in 1..N');
    p.groups.forEach(g => assert.strictEqual(g.sum, g.ids.reduce((s, i) => s + values[i], 0), 'group sum'));
    const h = p.circles.filter(c => c.hidden).length;
    assert.ok(h >= 3 && h <= (hiddenMode === 'few' ? 4 : 6), `hidden count ${h}`);
    assert.ok(p.circles[p.star].hidden, 'star on a hidden circle');
    assert.strictEqual(p.controlSum, digitalRoot(p.circles[p.star].value));
    assert.ok(p.controlSum >= 0 && p.controlSum <= 9);
    assert.strictEqual(solutions(p), 1, 'exactly one solution');
    p.circles.forEach(c => assert.ok(c.x >= 1 && c.y >= 1 && c.x <= p.w - 1 && c.y <= p.h - 1, 'circle inside the figure'));
    if (p.figure === 'row') {
        const k = p.groups.length;
        assert.ok(k >= 2 && k <= 4 && p.circles.length === 2 * (k + 1));
    }
    if (p.figure === 'block') assert.ok(p.circles.length === 9 && p.groups.length === 4 && p.n >= 9);
    if (p.figure === 'triangle') assert.ok(p.circles.length === 6 && p.groups.length === 3);
    assert.ok(p.text && !p.text.includes('{'), 'text filled');
}

for (const figure of FIGURES.filter(f => f !== 'mixed')) {
    for (const numberSet of NUMBER_SETS) {
        for (const hidden of HIDDEN) {
            const { problems, controlSums } = gen({ figure, numberSet, hidden });
            assert.strictEqual(problems.length, 9);
            assert.strictEqual(controlSums.length, 9);
            problems.forEach(p => {
                assert.strictEqual(p.figure, figure);
                assert.strictEqual(p.n, Math.max(Number(numberSet), figure === 'block' ? 9 : 0));
                check(p, hidden);
            });
        }
    }
}

// Rows with 12 numbers reach 4 squares.
assert.ok(Array.from({ length: 5 }).some(() => gen({ numberSet: '12' }).problems.some(p => p.groups.length === 4)), 'row of 4 squares');

const mixed = gen({ figure: 'mixed' }).problems;
assert.deepStrictEqual(new Set(mixed.map(p => p.figure)), new Set(['row', 'block', 'triangle']));

for (const [lang, t] of Object.entries(LOCALES)) {
    gen({ figure: 'mixed', translations: t }).problems.forEach(p => assert.ok(!p.text.includes('{'), `${lang} text`));
}

assert.strictEqual(gen({ numberOfProblems: 50 }).problems.length, 20);
assert.throws(() => gen({ figure: 'circle' }));
assert.throws(() => gen({ numberSet: '7' }));
assert.throws(() => gen({ hidden: 'all' }));
assert.throws(() => gen({ numberOfProblems: 0 }));

console.log('corner-sums tests passed');
