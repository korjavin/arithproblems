import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

// "List all possibilities / how many" olympiad problems. Every answer is one
// count ≤ maxCount (≤ 120, so listing them all stays feasible); the self-check
// digit is its digital root.
//   product   — one item from each of 2–3 groups (n1·n2·n3)
//   choose    — k of n, order irrelevant (C(n,k))
//   arrange   — permutations: n!, a fixed first element (n−1)!, repeated colours n!/2!
//   handshakes — each against each / max intersections of n lines (n(n−1)/2)
//   halftime  — half-time scores of a final a:b ((a+1)(b+1)), or with k second-half goals
//   dominoes  — tiles with pips 0..m ((m+1)(m+2)/2), or showing at least one v (m+1)
export const TYPES = ['product', 'choose', 'arrange', 'handshakes', 'halftime', 'dominoes'];
export const MAX_COUNT = 120;
const MAX_TRIES = 200;

export const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
export const binom = (n, k) => factorial(n) / (factorial(k) * factorial(n - k));
// Distinct rows of a multiset given the count of each kind: n! / (c1!·c2!·…).
export const arrangements = (counts) => counts.reduce((r, c) => r / factorial(c), factorial(counts.reduce((a, b) => a + b, 0)));

// Pairs (x, y), 0 ≤ x ≤ a, 0 ≤ y ≤ b, with x + y = a + b − k: half-time scores
// of a final a:b when k goals fell in the second half.
export const halfTimeScores = (a, b, k) => {
    let n = 0;
    for (let x = 0; x <= a; x++) for (let y = 0; y <= b; y++) if (a - x + b - y === k) n++;
    return n;
};

const take = (pool, n) => shuffleArray(pool).slice(0, n);

const MAKERS = {
    product(t, names) {
        const theme = getRandomFromArray(['menu', 'outfit']);
        const groups = t.product_groups[theme];
        // Keep the groups in their natural order (drink, main, dessert).
        const chosen = take(groups.map((_, i) => i), getRandomInt(2, 3)).sort((a, b) => a - b);
        const slots = chosen.map(i => ({ label: groups[i].label, items: take(groups[i].items, getRandomInt(2, 4)) }));
        return { variant: `product_${theme}`, data: { name: getRandomFromArray(names), slots }, answer: slots.reduce((p, s) => p * s.items.length, 1) };
    },

    choose(t, names) {
        const theme = getRandomFromArray(['friends', 'toppings', 'flavours']);
        const n = getRandomInt(4, 6), k = getRandomInt(2, 3);
        const people = take(names, n + 1);
        const items = theme === 'friends' ? people.slice(1) : take(t.choose_items[theme], n);
        return { variant: `choose_${theme}`, data: { name: people[0], items, k }, answer: binom(n, k) };
    },

    arrange(t, names) {
        const name = getRandomFromArray(names);
        const variant = getRandomFromArray(['arrange_apps', 'arrange_digits', 'arrange_first', 'arrange_cards', 'arrange_cards_start']);
        if (variant === 'arrange_apps' || variant === 'arrange_digits') {
            const n = getRandomInt(3, 4);
            const items = variant === 'arrange_apps' ? take(t.apps, n) : take([1, 2, 3, 4, 5, 6, 7, 8, 9], n).map(String);
            return { variant, data: { name, items }, answer: factorial(n) };
        }
        if (variant === 'arrange_first') {
            const items = take(t.apps, getRandomInt(4, 5));
            return { variant, data: { name, items, first: 0 }, answer: factorial(items.length - 1) };
        }
        // Cards: two of colour 0, one each of the others. counts[i] cards of colours[i].
        const kinds = variant === 'arrange_cards' ? getRandomInt(2, 4) : getRandomInt(3, 4);
        const colours = take(t.colours.map((_, i) => i), kinds);
        const counts = colours.map((_, i) => (i === 0 ? 2 : 1));
        if (variant === 'arrange_cards') return { variant, data: { name, colours, counts }, answer: arrangements(counts) };
        // The row must start with colour 0 or colour 1.
        const start = [0, 1];
        const answer = start.reduce((s, i) => s + arrangements(counts.map((c, j) => (j === i ? c - 1 : c))), 0);
        return { variant, data: { name, colours, counts, start }, answer };
    },

    handshakes() {
        const variant = getRandomFromArray(['handshakes', 'tournament', 'lines']);
        const n = getRandomInt(4, 7);
        return { variant, data: { n }, answer: (n * (n - 1)) / 2 };
    },

    halftime() {
        const a = getRandomInt(1, 4), b = getRandomInt(1, 4);
        if (getRandomInt(0, 1) === 0) return { variant: 'halftime', data: { a, b }, answer: (a + 1) * (b + 1) };
        // k second-half goals with at least two possible half-time scores.
        const ks = [];
        for (let k = 1; k < a + b; k++) if (halfTimeScores(a, b, k) >= 2) ks.push(k);
        const k = getRandomFromArray(ks);
        return { variant: 'halftime_second', data: { a, b, k }, answer: halfTimeScores(a, b, k) };
    },

    dominoes() {
        const m = getRandomInt(3, 6);
        if (getRandomInt(0, 1) === 0) return { variant: 'domino_set', data: { m }, answer: ((m + 1) * (m + 2)) / 2 };
        const v = getRandomInt(0, m);
        return { variant: 'domino_with', data: { m, v }, answer: m + 1 };
    },
};

function render(p, t) {
    const d = p.data;
    const list = (items) => items.join(', ');
    const vars = {
        name: d.name,
        n: d.n ?? (d.items && d.items.length),
        k: d.k, a: d.a, b: d.b, m: d.m, v: d.v,
        items: d.items && list(d.items),
        first: d.first !== undefined && d.items[d.first],
        groups: d.slots && d.slots.map(s => fillTemplate(t.group_format, { label: s.label, items: list(s.items) })).join(t.group_separator),
        cards: d.counts && list(d.colours.map((c, i) => fillTemplate(t.card_format, { colour: t.colours[c], count: d.counts[i] }))),
        start0: d.start && t.colours_start[d.colours[d.start[0]]],
        start1: d.start && t.colours_start[d.colours[d.start[1]]],
    };
    return `${fillTemplate(t.templates[p.variant], vars)} ${t.list_prompt}`;
}

export function generateCombinatoricsData({ types, maxCount = 24, numberOfProblems, translations: t, names }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // Every type has instances ≤ 6, so 6 is the smallest cap that always works.
    if (!Number.isFinite(maxCount) || maxCount < 6) throw new Error('Invalid largest answer.');
    const cap = Math.min(MAX_COUNT, maxCount);
    // Up to 6 friends plus the one who invites them.
    if (!Array.isArray(names) || new Set(names).size < 7) throw new Error('Need at least 7 distinct names.');
    const people = [...new Set(names)];
    // ponytail: prose sheet with tall listing space; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        let p;
        for (let tries = 0; tries < MAX_TRIES && !(p && p.answer <= cap); tries++) p = { type, ...MAKERS[type](t, people) };
        if (p.answer > cap) throw new Error(`No ${type} problem fits the largest answer ${cap}.`);
        p.text = render(p, t);
        p.controlSum = digitalRoot(p.answer);
        problems.push(p);
    }
    const shuffled = shuffleArray(problems); // interleave types so a sheet does not run in blocks
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
