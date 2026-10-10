import assert from 'assert';
import fs from 'fs';
import { generateIntegerSolutionsData, solutions, TYPES, NOTES, PRICES, COINS } from './generators/integer-solutions.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.integer_solutions]));
const gen = (types, lang = 'en', numberOfProblems = 30) => generateIntegerSolutionsData({ types, numberOfProblems, translations: LOCALES[lang] });

// Engine against hand-computed cases.
// 18 legs, chickens + sheep, at least one each: (7,1) (5,2) (3,3) (1,4).
assert.deepStrictEqual(solutions([2, 4], 18, { minEach: 1 }), [[1, 4], [3, 3], [5, 2], [7, 1]]);
// 10 animals, 28 legs: 6 chickens, 4 sheep.
assert.deepStrictEqual(solutions([2, 4], 28, { countTotal: 10 }), [[6, 4]]);
// 4a + 5b = 40, a, b ≥ 1: (5, 4) only.
assert.deepStrictEqual(solutions([4, 5], 40, { minEach: 1 }), [[5, 4]]);
// 540 € from 200/100/20: a=2 → (2,1,1)(2,0,7); a=1 → (1,3,1)(1,2,6)(1,1,11)(1,0,16); a=0 → b 0..5.
assert.strictEqual(solutions(NOTES, 540).length, 12);
// Subset sums with each number at most once; strike 3 digits.
assert.deepStrictEqual(solutions([10, 20, 30, 40], 60, { maxEach: 1 }), [[0, 1, 0, 1], [1, 1, 1, 0]]); // 20+40, 10+20+30
assert.strictEqual(solutions([1, 2, 3, 4, 5], 6, { maxEach: 1, countTotal: 3 }).length, 1); // 1+2+3
// Per-coefficient minimum: three notes, at least one 5 €, total 25 → only 5+10+10.
assert.deepStrictEqual(solutions([5, 10, 20, 50], 25, { countTotal: 3, minEach: [1, 0, 0, 0] }), [[1, 2, 0, 0]]);
assert.deepStrictEqual(solutions([3], 7), []);

const at = (x, i, d) => (Array.isArray(x) ? x[i] : x ?? d);
// Independent brute force: every vector with 0 ≤ x_i ≤ total / c_i.
function brute(coeffs, total, { countTotal, minEach = 0, maxEach = Infinity } = {}) {
    let rows = [[]];
    coeffs.forEach((c, i) => {
        const hi = Math.min(at(maxEach, i), Math.floor(total / c));
        rows = rows.flatMap(r => Array.from({ length: Math.max(0, hi - at(minEach, i) + 1) }, (_, k) => [...r, at(minEach, i) + k]));
    });
    return rows.filter(r => r.reduce((s, x, i) => s + x * coeffs[i], 0) === total && (countTotal === undefined || r.reduce((a, b) => a + b, 0) === countTotal));
}
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

// Re-derive the answer of each instance by brute force.
function expected(p) {
    const d = p.data;
    switch (p.variant) {
        case 'legs_count': {
            assert(d.n >= 5 && d.n <= 20);
            const s = brute([2, 4], d.legs, { countTotal: d.n, minEach: 1 });
            assert.strictEqual(s.length, 1, 'unique legs solution');
            return s[0][1];
        }
        case 'legs_all': return brute([2, 4], d.legs, { minEach: 1 }).length;
        case 'legs_three': assert(d.n >= 5 && d.n <= 12); return brute([2, 4, 6], d.legs, { countTotal: d.n, minEach: 1 }).length;
        case 'vertices': assert(d.v >= 18 && d.v <= 60); return brute([4, 5], d.v, { minEach: 1 }).length;
        case 'market_count': case 'market_most': {
            const prices = [d.p1, d.p2, d.p3];
            assert(PRICES.some(x => String(x) === String(prices)));
            const all = brute(prices, 100, { minEach: 1 });
            if (p.variant === 'market_most') return Math.max(...all.map(sum));
            const s = all.filter(x => sum(x) === d.n);
            assert.strictEqual(s.length, 1, 'unique market solution');
            assert.deepStrictEqual(p.solution, s[0]);
            return s[0][2];
        }
        case 'money_ways': return brute(NOTES, d.a).length;
        case 'money_fewest': return Math.min(...brute(NOTES, d.a).map(sum));
        case 'money_most': assert.strictEqual(Math.max(...brute(NOTES, d.a).map(sum)), d.a / 20); return d.a / 20;
        case 'note_coins': {
            assert([5, 10, 20].includes(d.note));
            assert(d.coins.length >= 3 && d.coins.length <= 6 && new Set(d.coins).size === d.coins.length);
            assert(d.coins.every(c => COINS.includes(c)));
            return new Set(d.coins.map(c => 100 * d.note + 3 * c)).size; // distinct totals in cents
        }
        case 'notes_three': {
            const notes = [5, 10, 20, 50];
            const totals = new Set();
            for (const a of notes) for (const b of notes) for (const c of notes) if ([a, b, c].includes(5) && a + b + c < d.l) totals.add(a + b + c);
            return totals.size;
        }
        case 'subset_sum': {
            assert(d.items.length >= 6 && d.items.length <= 8 && new Set(d.items).size === d.items.length);
            assert(d.items.every(x => x >= 10 && x <= 40));
            return brute(d.items, 100, { maxEach: 1 }).length;
        }
        case 'subset_digits': {
            assert(d.items.length === 8 && new Set(d.items).size === 8 && d.items.every(x => x >= 1 && x <= 9));
            return brute(d.items, sum(d.items) - d.s, { maxEach: 1, countTotal: 3 }).length;
        }
        case 'matches': {
            assert(d.k >= 2 && d.k <= 3);
            assert.strictEqual(d.m % (4 * d.k), d.left);
            return Math.floor(d.m / (4 * d.k));
        }
        case 'parity_pairs': case 'parity_pick': {
            const pairs = brute([1, 1], d.t, { minEach: 1 }).filter(([a, b]) => a % 2 === 0 && b % 2 === 1);
            if (p.variant === 'parity_pairs') return pairs.length;
            const hit = pairs.filter(([a, b]) => d.c1 * a + d.c2 * b === d.w);
            assert.strictEqual(hit.length, 1, 'unique parity pair');
            return hit[0][0];
        }
        default: throw new Error(`unknown variant ${p.variant}`);
    }
}

const seen = new Set();
for (const lang of ['en', 'de', 'ru']) {
    const t = LOCALES[lang];
    for (const type of TYPES) {
        for (let run = 0; run < 15; run++) {
            const { problems, controlSums } = gen([type], lang);
            assert.strictEqual(problems.length, 30);
            problems.forEach((p, i) => {
                seen.add(p.variant);
                assert.strictEqual(p.type, type);
                assert.strictEqual(expected(p), p.answer, `${p.variant} ${JSON.stringify(p.data)}`);
                if (p.mode === 'all') {
                    // "Find all": the digit is the number of solutions, a single digit by construction.
                    assert(p.answer >= 1 && p.answer <= 9, `${p.variant} has ${p.answer} solutions`);
                    if (!p.variant.startsWith('subset')) assert(p.answer >= 2, `${p.variant} has several solutions`);
                    else assert(p.answer <= 4);
                    assert.strictEqual(p.controlSum, p.answer);
                    assert(p.text.endsWith(t.find_all));
                } else {
                    assert.strictEqual(p.mode, 'unique');
                    assert.strictEqual(p.controlSum, digitalRoot(p.answer));
                }
                assert(p.controlSum >= 0 && p.controlSum <= 9);
                assert.strictEqual(controlSums[i].controlSum, p.controlSum);
                assert(!/{\w+}|undefined|NaN/.test(p.text), `unfilled template: ${p.text}`);
            });
        }
    }
}
['legs_count', 'legs_all', 'legs_three', 'vertices', 'market_count', 'market_most', 'money_ways', 'money_fewest', 'money_most', 'notes_three', 'note_coins',
    'subset_sum', 'subset_digits', 'matches', 'parity_pairs', 'parity_pick'].forEach(v => assert(seen.has(v), `variant ${v} generated`));

// Mixed sheet respects the count and the cap of 30.
assert.strictEqual(gen(TYPES, 'en', 12).problems.length, 12);
assert.strictEqual(gen(TYPES, 'en', 100).problems.length, 30);

// Invalid input.
assert.throws(() => gen([]));
assert.throws(() => gen(['nope']));
assert.throws(() => gen(TYPES, 'en', 0));
assert.throws(() => gen(TYPES, 'en', NaN));

// Locales carry the same keys.
const keys = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`])).sort();
assert.deepStrictEqual(keys(LOCALES.de), keys(LOCALES.en));
assert.deepStrictEqual(keys(LOCALES.ru), keys(LOCALES.en));

console.log('All integer-solutions tests passed!');
