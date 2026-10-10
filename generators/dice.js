import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate, plural } from '../utils.js';

// Dice with the "opposite faces add up to 7" rule: complete a net, towers,
// dice glued one after another, dice glued in a row on the table, tipping a die over its edges,
// and three views of one lettered cube.
// To add a sub-type: add its id to TYPES and a maker to MAKERS returning
// { variant, data, answer } (+ optional picture data for the renderer).
export const TYPES = ['net', 'tower', 'glued', 'table_row', 'tip', 'views'];

// Die orientation: s[pos] = face on that side, positions top, bottom, front, back, right, left
// (0|1, 2|3, 4|5 opposite). A tip over an edge: new[i] = old[TIPS[dir][i]].
const [T, B, F, K, R, L] = [0, 1, 2, 3, 4, 5];
export const TIPS = {
    right: [L, R, F, K, T, B], // top → right, right → bottom, bottom → left, left → top
    left: [R, L, F, K, B, T],
    toward: [K, F, T, B, R, L], // top → front (towards the viewer)
    away: [F, K, B, T, R, L],
};
export const DIRS = Object.keys(TIPS);
export const tip = (s, dir) => TIPS[dir].map(i => s[i]);
// Standard right-handed die: 1 top, 2 front, 3 right.
export const START = [1, 6, 2, 5, 3, 4];

// The 24 rotations as position permutations (closure of the tips): rotated[i] = s[r[i]].
const ROTATIONS = (() => {
    const seen = new Map([['0,1,2,3,4,5', [0, 1, 2, 3, 4, 5]]]);
    for (const r of seen.values()) for (const d of DIRS) { const n = tip(r, d); seen.has(`${n}`) || seen.set(`${n}`, n); }
    return [...seen.values()];
})();
const PERMS = (function perms(a) { return a.length < 2 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])); })([0, 1, 2, 3, 4, 5]);
const viewOf = s => [s[T], s[F], s[R]];

// Opposite of letter x for every letter assignment consistent with all views (some rotation shows each view).
export function oppositesFromViews(views, x) {
    const res = new Set();
    for (const lab of PERMS) {
        const ok = views.every(v => ROTATIONS.some(r => `${viewOf(r.map(i => lab[i]))}` === `${v}`));
        if (ok) res.add(lab[lab.indexOf(x) ^ 1]);
    }
    return res;
}

const randomDie = () => { let s = START; for (let i = getRandomInt(4, 10); i > 0; i--) s = tip(s, getRandomFromArray(DIRS)); return s; };

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
    tip() {
        const s = randomDie();
        if (getRandomInt(0, 1)) {
            const moves = Array.from({ length: getRandomInt(1, 3) }, () => getRandomFromArray(DIRS));
            return { variant: 'tip_moves', data: { moves }, answer: moves.reduce(tip, s)[T], cube: viewOf(s) };
        }
        // Strip of n squares: the die stands on the first one and tips right onto each next square up to the ★.
        const n = getRandomInt(2, 4);
        return { variant: 'tip_path', data: {}, answer: Array(n - 1).fill('right').reduce(tip, s)[T], cube: viewOf(s), strip: n };
    },
    views() {
        // Letters 0..5 (A..F) on a cube, shown in 3 different positions; ask only uniquely determined faces.
        for (;;) {
            const lab = shuffleArray([0, 1, 2, 3, 4, 5]);
            const views = shuffleArray([...ROTATIONS]).slice(0, 3).map(r => viewOf(r.map(i => lab[i])));
            const unique = x => oppositesFromViews(views, x).size === 1;
            const opp = x => lab[lab.indexOf(x) ^ 1];
            if (getRandomInt(0, 1)) {
                const xs = [0, 1, 2, 3, 4, 5].filter(unique);
                if (!xs.length) continue;
                const x = getRandomFromArray(xs);
                return { variant: 'views_opposite', data: { x }, answer: opp(x) + 1, views };
            }
            const vs = [0, 1, 2].filter(v => unique(views[v][0]));
            if (!vs.length) continue;
            const v = getRandomFromArray(vs);
            return { variant: 'views_bottom', data: { v: v + 1 }, answer: opp(views[v][0]) + 1, views };
        }
    },
};

function text(p, t) {
    const d = p.data;
    const dice = d.k && plural(t.dice_forms, d.k);
    const pips = n => plural(t.pip_forms, n);
    const contacts = d.contacts && d.contacts.map(c => fillTemplate(t.templates[c.g ? 'contact_equal' : 'contact_free'], { a: c.a, b: c.b, g: c.g && pips(c.g), x: c.x && pips(c.x), y: c.y && pips(c.y) })).join('; ');
    const moves = d.moves && d.moves.map(m => t.dirs[m]).join(t.then);
    return fillTemplate(t.templates[p.variant], { moves, letters: t.letters.join(', '), x: d.x !== undefined && t.letters[d.x], v: d.v, dice, top: d.top && pips(d.top), contacts, tops: d.tops && d.tops.join(', '), visible: d.visible && pips(d.visible) });
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
