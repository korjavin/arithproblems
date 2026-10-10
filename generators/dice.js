import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate, plural } from '../utils.js';

// Dice with the "opposite faces add up to 7" rule: complete a net, towers,
// dice glued one after another, dice glued in a row on the table.
// To add a sub-type: add its id to TYPES and a maker to MAKERS returning
// { variant, data, answer } (+ optional picture data for the renderer).
export const TYPES = ['net', 'tower', 'glued', 'table_row'];

// The 11 cube nets as [col, row] cells; opp[i] = index of the cell folded opposite cell i.
// Derived by rolling a cube over the net; test-dice.js re-checks every pairing by the same fold.
export const NETS = [
    ...[[0, 0], [0, 1], [0, 2], [0, 3], [1, 1], [1, 2]].map(([a, b]) => ({ cells: [[a, 0], [0, 1], [1, 1], [2, 1], [3, 1], [b, 2]], opp: [5, 3, 4, 1, 2, 0] })),
    ...[1, 2, 3].map(b => ({ cells: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [b, 2]], opp: [3, 5, 4, 0, 2, 1] })),
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], opp: [3, 4, 5, 0, 1, 2] },
    { cells: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]], opp: [2, 4, 0, 5, 1, 3] },
];

// Glued equal values a, b on three dice give 63 − 2(a + b) visible pips; these sums have exactly
// one pair a ≠ b (the middle die cannot use one face twice), so the inverse question is unique.
export const UNIQUE_PAIR_SUMS = [3, 4, 10, 11];

// Random rotation/reflection of a net (keeps cell order, so opp stays valid).
function placeNet({ cells, opp }) {
    const swap = getRandomInt(0, 1);
    let c = cells.map(([x, y]) => (swap ? [y, x] : [x, y]));
    for (const axis of [0, 1]) {
        if (getRandomInt(0, 1)) {
            const max = Math.max(...c.map(p => p[axis]));
            c = c.map(p => p.map((v, i) => (i === axis ? max - v : v)));
        }
    }
    return { cells: c, opp };
}

// k − 1 glued values where neighbours differ (a middle die glues two different faces).
const chain = (k) => {
    const g = [getRandomInt(1, 6)];
    while (g.length < k - 1) g.push(getRandomFromArray([1, 2, 3, 4, 5, 6].filter(v => v !== g[g.length - 1])));
    return g;
};

const MAKERS = {
    net() {
        const net = placeNet(getRandomFromArray(NETS));
        // Values: each opposite pair gets {v, 7 − v}.
        const values = new Array(6);
        const pairs = shuffleArray([1, 2, 3]);
        let p = 0;
        net.opp.forEach((j, i) => {
            if (values[i] !== undefined) return;
            const v = getRandomInt(0, 1) ? pairs[p] : 7 - pairs[p];
            values[i] = v; values[j] = 7 - v; p++;
        });
        // Show one face of each opposite pair, star one of the hidden ones.
        const shown = [];
        net.opp.forEach((j, i) => { if (i < j) shown.push(getRandomInt(0, 1) ? i : j); });
        const hidden = [0, 1, 2, 3, 4, 5].filter(i => !shown.includes(i));
        const star = getRandomFromArray(hidden);
        return { variant: 'net', data: {}, answer: values[star], net: { cells: net.cells, opp: net.opp, values, shown, star } };
    },
    tower() {
        const k = getRandomInt(2, 8), top = getRandomInt(1, 6);
        return getRandomInt(0, 1)
            ? { variant: 'tower_hidden', data: { k, top }, answer: 7 * k - top, tower: { k, top } }
            : { variant: 'tower_visible', data: { k, top }, answer: 14 * k + top, tower: { k, top } };
    },
    glued() {
        const kind = getRandomInt(0, 2);
        if (kind === 0) {
            const k = getRandomInt(2, 4), g = chain(k);
            return { variant: 'glued_equal', data: { k, contacts: g.map((x, i) => ({ a: i + 1, b: i + 2, g: x })) }, answer: 21 * k - 2 * g.reduce((s, x) => s + x, 0) };
        }
        if (kind === 1) {
            // Free values: x on the left die, y on the right one; a middle die's two glued faces differ.
            const k = getRandomInt(2, 4), contacts = [];
            for (let i = 0; i < k - 1; i++) {
                const x = getRandomFromArray([1, 2, 3, 4, 5, 6].filter(v => i === 0 || v !== contacts[i - 1].y));
                contacts.push({ a: i + 1, b: i + 2, x, y: getRandomInt(1, 6) });
            }
            return { variant: 'glued_free', data: { k, contacts }, answer: 21 * k - contacts.reduce((s, c) => s + c.x + c.y, 0) };
        }
        const s = getRandomFromArray(UNIQUE_PAIR_SUMS);
        const a = getRandomFromArray([1, 2, 3, 4, 5, 6].filter(v => s - v >= 1 && s - v <= 6 && s - v !== v));
        return { variant: 'glued_inverse', data: { k: 3, visible: 63 - 2 * s }, answer: s, pair: [a, s - a] };
    },
    table_row() {
        // Straight row: a middle die's left and right faces are opposite, so the glued values
        // alternate g, 7 − g, g, …; the top faces come from the other two opposite pairs.
        const k = getRandomInt(2, 7), g = getRandomInt(1, 6);
        const contacts = Array.from({ length: k - 1 }, (_, i) => ({ a: i + 1, b: i + 2, g: i % 2 ? 7 - g : g }));
        const tops = Array.from({ length: k }, () => getRandomFromArray([1, 2, 3, 4, 5, 6].filter(v => v !== g && v !== 7 - g)));
        const answer = 21 * k - tops.reduce((s, t) => s + 7 - t, 0) - 2 * contacts.reduce((s, c) => s + c.g, 0);
        return { variant: 'table_row', data: { k, contacts, tops }, answer };
    },
};

function text(p, t) {
    const d = p.data;
    const dice = d.k && plural(t.dice_forms, d.k);
    const pips = n => plural(t.pip_forms, n);
    const contacts = d.contacts && d.contacts.map(c => fillTemplate(t.templates[c.g ? 'contact_equal' : 'contact_free'], { a: c.a, b: c.b, g: c.g && pips(c.g), x: c.x && pips(c.x), y: c.y && pips(c.y) })).join('; ');
    return fillTemplate(t.templates[p.variant], { dice, top: d.top && pips(d.top), contacts, tops: d.tops && d.tops.join(', '), visible: d.visible && pips(d.visible) });
}

export function generateDiceData({ types, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: prose sheet; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, ...MAKERS[type]() };
        p.text = text(p, t);
        p.controlSum = digitalRoot(p.answer);
        problems.push(p);
    }
    const shuffled = shuffleArray(problems);
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
