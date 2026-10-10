import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

// Small Diophantine search olympiad problems (legs, vertices, market, money,
// subset sums, matchsticks, parity). Every sub-type is a skin over solutions():
// the maker picks parameters whose solution count is what the problem promises.
// mode 'all'    — "find all solutions": self-check digit = number of solutions (1–9)
// mode 'unique' — one asked number: self-check digit = its digital root
export const TYPES = ['legs', 'vertices', 'market', 'money', 'subset', 'matches', 'parity'];
const MAX_TRIES = 500;

// All integer vectors x with Σ coeffs[i]·x[i] = total (and Σ x[i] = countTotal
// when given). minEach / maxEach: one bound for all, or an array per coefficient.
// ponytail: plain DFS, coeffs must be positive; fine for totals up to ~1000.
export function solutions(coeffs, total, { countTotal, minEach = 0, maxEach = Infinity } = {}) {
    const at = (v, i) => (Array.isArray(v) ? v[i] : v);
    const out = [];
    const walk = (i, rest, count, x) => {
        if (i === coeffs.length) {
            if (rest === 0 && (countTotal === undefined || count === countTotal)) out.push(x);
            return;
        }
        for (let v = at(minEach, i); v <= at(maxEach, i) && v * coeffs[i] <= rest && (countTotal === undefined || count + v <= countTotal); v++) {
            walk(i + 1, rest - v * coeffs[i], count + v, [...x, v]);
        }
    };
    walk(0, total, 0, []);
    return out;
}

const range = (from, to, step = 1) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
// A random parameter among those whose solution count lies in [lo, hi].
const pickByCount = (params, count, lo, hi) => getRandomFromArray(params.filter(p => { const n = count(p); return n >= lo && n <= hi; }));

export const NOTES = [200, 100, 20];
export const WALLET_NOTES = [5, 10, 20, 50];
export const PRICES = [[5, 3, 1], [10, 5, 3], [10, 5, 2]];

// Amounts below limit made of exactly three wallet notes, at least one 5 €.
export const walletTotals = (limit) => range(15, limit - 1).filter(s => solutions(WALLET_NOTES, s, { countTotal: 3, minEach: [1, 0, 0, 0] }).length);
// Pairs (a, b) of naturals with a + b = t, a even, b odd.
export const parityPairs = (t) => solutions([1, 1], t, { minEach: 1 }).filter(([a, b]) => a % 2 === 0 && b % 2 === 1);

const MAKERS = {
    legs() {
        const variant = getRandomFromArray(['legs_count', 'legs_all', 'legs_three']);
        if (variant === 'legs_count') {
            const n = getRandomInt(5, 20), sheep = getRandomInt(1, n - 1);
            return { variant, mode: 'unique', data: { n, legs: 2 * (n - sheep) + 4 * sheep }, answer: sheep };
        }
        if (variant === 'legs_all') {
            const legs = pickByCount(range(10, 30, 2), l => solutions([2, 4], l, { minEach: 1 }).length, 2, 6);
            return { variant, mode: 'all', data: { legs }, answer: solutions([2, 4], legs, { minEach: 1 }).length };
        }
        const n = getRandomInt(5, 12);
        const legs = pickByCount(range(12, 6 * n, 2), l => solutions([2, 4, 6], l, { countTotal: n, minEach: 1 }).length, 2, 6);
        return { variant, mode: 'all', data: { n, legs }, answer: solutions([2, 4, 6], legs, { countTotal: n, minEach: 1 }).length };
    },

    vertices() {
        const v = pickByCount(range(18, 60), x => solutions([4, 5], x, { minEach: 1 }).length, 2, 6);
        return { variant: 'vertices', mode: 'all', data: { v }, answer: solutions([4, 5], v, { minEach: 1 }).length };
    },

    market() {
        const prices = getRandomFromArray(PRICES);
        const all = solutions(prices, 100, { minEach: 1 });
        const data = { p1: prices[0], p2: prices[1], p3: prices[2] };
        if (getRandomInt(0, 1) === 0) return { variant: 'market_most', mode: 'unique', data, answer: Math.max(...all.map(sum)) };
        // Animal counts n with exactly one way to spend 100 €.
        const byCount = {};
        all.forEach(x => (byCount[sum(x)] = byCount[sum(x)] || []).push(x));
        const n = Number(getRandomFromArray(Object.keys(byCount).filter(k => byCount[k].length === 1)));
        return { variant: 'market_count', mode: 'unique', data: { ...data, n }, solution: byCount[n][0], answer: byCount[n][0][2] };
    },

    money() {
        const variant = getRandomFromArray(['money_ways', 'money_fewest', 'notes_three']);
        if (variant === 'money_ways') {
            const a = pickByCount(range(100, 600, 20), x => solutions(NOTES, x).length, 2, 6);
            return { variant, mode: 'all', data: { a }, answer: solutions(NOTES, a).length };
        }
        if (variant === 'money_fewest') {
            const a = getRandomFromArray(range(120, 980, 20));
            return { variant, mode: 'unique', data: { a }, answer: Math.min(...solutions(NOTES, a).map(sum)) };
        }
        const l = getRandomFromArray(range(30, 100, 10));
        return { variant, mode: 'all', data: { l }, answer: walletTotals(l).length };
    },

    subset() {
        if (getRandomInt(0, 1) === 0) {
            for (let tries = 0; tries < MAX_TRIES; tries++) {
                const items = shuffleArray(range(10, 40)).slice(0, getRandomInt(6, 8));
                const n = solutions(items, 100, { maxEach: 1 }).length;
                if (n >= 1 && n <= 4) return { variant: 'subset_sum', mode: 'all', data: { items }, answer: n };
            }
            throw new Error('No subset-sum list found.');
        }
        const items = shuffleArray(range(1, 9)).slice(0, 8);
        const strike = (d) => solutions(items, d, { maxEach: 1, countTotal: 3 }).length;
        const d = pickByCount(range(6, 24), strike, 1, 4);
        return { variant: 'subset_digits', mode: 'all', data: { items, s: sum(items) - d }, answer: strike(d) };
    },

    matches() {
        const k = getRandomInt(2, 3), squares = getRandomInt(2, 6), left = getRandomInt(0, 4 * k - 1);
        return { variant: 'matches', mode: 'unique', data: { k, m: 4 * k * squares + left, left }, answer: squares };
    },

    parity() {
        const t = getRandomFromArray(range(7, 17, 2));
        if (getRandomInt(0, 1) === 0) return { variant: 'parity_pairs', mode: 'all', data: { t }, answer: parityPairs(t).length };
        const [a, b] = getRandomFromArray(parityPairs(t));
        const [c1, c2] = shuffleArray([2, 3, 4, 5]).slice(0, 2); // c1 ≠ c2, so a + b = t fixes one pair
        return { variant: 'parity_pick', mode: 'unique', data: { t, c1, c2, w: c1 * a + c2 * b }, solution: [a, b], answer: a };
    },
};

function render(p, t) {
    const d = p.data;
    const text = fillTemplate(t.templates[p.variant], { ...d, items: d.items && d.items.join(', ') });
    return p.mode === 'all' ? `${text} ${t.find_all}` : text;
}

export function generateIntegerSolutionsData({ types, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: prose sheet with tall listing space; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, ...MAKERS[type]() };
        p.text = render(p, t);
        p.controlSum = p.mode === 'all' ? p.answer : digitalRoot(p.answer);
        problems.push(p);
    }
    const shuffled = shuffleArray(problems); // interleave types so a sheet does not run in blocks
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
