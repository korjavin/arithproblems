import assert from 'assert';
import fs from 'fs';
import { generateCombinatoricsData, TYPES, MAX_COUNT } from './generators/combinatorics.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => {
    const script = JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script;
    return [l, { t: script.combinatorics, names: [...script.word_problems.names.male, ...script.word_problems.names.female] }];
}));

function gen(types, maxCount, lang = 'en', numberOfProblems = 30) {
    const { t, names } = LOCALES[lang];
    return generateCombinatoricsData({ types, maxCount, numberOfProblems, translations: t, names });
}

// Brute-force enumerators: return the actual list of possibilities.
const cartesian = (lists) => lists.reduce((acc, l) => acc.flatMap(a => l.map(x => [...a, x])), [[]]);
const subsets = (items, k) => (k === 0 ? [[]] : items.flatMap((x, i) => subsets(items.slice(i + 1), k - 1).map(s => [x, ...s])));
const permutations = (items) => (items.length <= 1 ? [items] : items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(p => [x, ...p])));
const distinct = (rows) => new Set(rows.map(r => JSON.stringify(r))).size;

function enumerate(p) {
    const d = p.data;
    switch (p.variant) {
        case 'product_menu': case 'product_outfit':
            assert(d.slots.length >= 2 && d.slots.length <= 3);
            d.slots.forEach(s => assert(s.items.length >= 2 && s.items.length <= 4 && new Set(s.items).size === s.items.length));
            return distinct(cartesian(d.slots.map(s => s.items)));
        case 'choose_friends': case 'choose_toppings': case 'choose_flavours':
            assert(d.items.length >= 4 && d.items.length <= 6 && d.k >= 2 && d.k <= 3);
            assert.strictEqual(new Set(d.items).size, d.items.length);
            if (p.variant === 'choose_friends') assert(!d.items.includes(d.name));
            return distinct(subsets(d.items, d.k).map(s => [...s].sort()));
        case 'arrange_apps': case 'arrange_digits':
            assert(d.items.length >= 3 && d.items.length <= 4 && new Set(d.items).size === d.items.length);
            return distinct(permutations(d.items));
        case 'arrange_first':
            assert(d.items.length >= 4 && d.items.length <= 5);
            return distinct(permutations(d.items).filter(r => r[0] === d.items[d.first]));
        case 'arrange_cards': case 'arrange_cards_start': {
            const cards = d.colours.flatMap((c, i) => Array(d.counts[i]).fill(c));
            assert.strictEqual(d.counts[0], 2);
            assert(d.counts.slice(1).every(c => c === 1));
            const rows = permutations(cards);
            if (p.variant === 'arrange_cards') return distinct(rows);
            const first = d.start.map(i => d.colours[i]);
            return distinct(rows.filter(r => first.includes(r[0])));
        }
        case 'handshakes': case 'tournament': case 'lines': {
            assert(d.n >= 4 && d.n <= 7);
            const people = Array.from({ length: d.n }, (_, i) => i);
            return distinct(cartesian([people, people]).filter(([a, b]) => a < b));
        }
        case 'halftime': case 'halftime_second': {
            assert(d.a >= 1 && d.a <= 4 && d.b >= 1 && d.b <= 4);
            const scores = cartesian([[...Array(d.a + 1).keys()], [...Array(d.b + 1).keys()]]);
            if (p.variant === 'halftime') return distinct(scores);
            const n = distinct(scores.filter(([x, y]) => d.a - x + d.b - y === d.k));
            assert(n >= 2, 'at least two half-time scores');
            return n;
        }
        case 'domino_set': case 'domino_with': {
            assert(d.m >= 3 && d.m <= 6);
            const pips = [...Array(d.m + 1).keys()];
            const tiles = cartesian([pips, pips]).filter(([a, b]) => a <= b);
            if (p.variant === 'domino_set') return distinct(tiles);
            assert(d.v >= 0 && d.v <= d.m);
            return distinct(tiles.filter(tile => tile.includes(d.v)));
        }
        default:
            throw new Error(`unknown variant ${p.variant}`);
    }
}

function check(problems, controlSums, cap, lang) {
    const { t } = LOCALES[lang];
    assert.strictEqual(problems.length, controlSums.length);
    problems.forEach((p, i) => {
        assert.strictEqual(enumerate(p), p.answer, `${p.variant} ${JSON.stringify(p.data)}`);
        assert(p.answer >= 2 && p.answer <= cap && p.answer <= MAX_COUNT, `count ${p.answer} within cap ${cap}`);
        assert.strictEqual(p.controlSum, digitalRoot(p.answer));
        assert(p.controlSum >= 0 && p.controlSum <= 9);
        assert.strictEqual(controlSums[i].controlSum, p.controlSum);
        assert(!/{\w+}|undefined|false|NaN/.test(p.text), `unfilled template: ${p.text}`);
        assert(p.text.endsWith(t.list_prompt));
    });
}

// Every type, every locale, every cap offered by the controls.
for (const lang of ['en', 'de', 'ru']) {
    for (const cap of [12, 24, 60, 120]) {
        for (const type of TYPES) {
            for (let run = 0; run < 10; run++) {
                const { problems, controlSums } = gen([type], cap, lang);
                assert(problems.every(p => p.type === type));
                check(problems, controlSums, cap, lang);
            }
        }
    }
}

// All variants show up with a generous cap.
const seen = new Set();
for (let run = 0; run < 50; run++) gen(TYPES, 120).problems.forEach(p => seen.add(p.variant));
['product_menu', 'product_outfit', 'choose_friends', 'choose_toppings', 'choose_flavours', 'arrange_apps', 'arrange_digits',
    'arrange_first', 'arrange_cards', 'arrange_cards_start', 'handshakes', 'tournament', 'lines', 'halftime', 'halftime_second',
    'domino_set', 'domino_with'].forEach(v => assert(seen.has(v), `variant ${v} generated`));

// Mixed types interleave and respect the problem count; cap above 120 is clamped.
const mixed = gen(TYPES, 500, 'en', 12);
assert.strictEqual(mixed.problems.length, 12);
assert(mixed.problems.every(p => p.answer <= MAX_COUNT));
assert.strictEqual(gen(TYPES, 24, 'en', 100).problems.length, 30);
// The smallest cap still works for every type.
TYPES.forEach(type => check(gen([type], 6).problems, gen([type], 6).controlSums, 6, 'en'));

// Invalid input.
assert.throws(() => gen([], 24));
assert.throws(() => gen(['nope'], 24));
assert.throws(() => gen(TYPES, 5));
assert.throws(() => gen(TYPES, NaN));
assert.throws(() => generateCombinatoricsData({ types: TYPES, maxCount: 24, numberOfProblems: 0, translations: LOCALES.en.t, names: LOCALES.en.names }));
assert.throws(() => generateCombinatoricsData({ types: TYPES, maxCount: 24, numberOfProblems: 5, translations: LOCALES.en.t, names: ['A', 'B'] }));

// Locales carry the same keys.
const keys = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`])).sort();
assert.deepStrictEqual(keys(LOCALES.de.t), keys(LOCALES.en.t));
assert.deepStrictEqual(keys(LOCALES.ru.t), keys(LOCALES.en.t));
['de', 'ru'].forEach(l => assert.strictEqual(LOCALES[l].t.colours_start.length, LOCALES[l].t.colours.length));

console.log('All combinatorics tests passed!');
