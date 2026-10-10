import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

// Numbers in circles at the corners of a figure; every group (a square's 4 corners, or a
// triangle side's 3 circles) shows the sum of its numbers. Use 1..N, each at most once.
// (The 2-corner Rechenviereck lives in magic-squares.js — that one sums pairs, not squares.)
// Coordinates are in paper cells: circles have radius 1 on a lattice of 3-cell spacing.
// A problem is { figure, n, circles: [{ x, y, value, hidden }], groups: [{ ids, sum, x, y }],
// rects, edges, w, h, star (circle index), text }. Self-check: digitalRoot(value in ★).
export const FIGURES = ['row', 'block', 'triangle', 'mixed'];
export const NUMBER_SETS = ['8', '9', '12'];
export const HIDDEN = ['few', 'many'];
const MAX_TRIES = 300;

const at = (i, j) => ({ x: 1 + 3 * i, y: 1 + 3 * j });

// A row of k squares sharing vertical edges: top circles 0..k, bottom circles k+1..2k+1.
export function rowFigure(k) {
    const circles = [...Array(k + 1).keys()].map(i => at(i, 0)).concat([...Array(k + 1).keys()].map(i => at(i, 1)));
    const groups = [...Array(k).keys()].map(i => ({ ids: [i, i + 1, k + 1 + i, k + 2 + i], x: 2.5 + 3 * i, y: 2.5 }));
    return { circles, groups, rects: groups.map((_, i) => [1 + 3 * i, 1, 3, 3]), edges: [], w: 3 * k + 2, h: 5 };
}

// A 2×2 block of squares: 3×3 circles, row-wise.
export function blockFigure() {
    const circles = [0, 1, 2].flatMap(j => [0, 1, 2].map(i => at(i, j)));
    const groups = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => ({ ids: [3 * j + i, 3 * j + i + 1, 3 * j + i + 3, 3 * j + i + 4], x: 2.5 + 3 * i, y: 2.5 + 3 * j }));
    return { circles, groups, rects: groups.map(g => [g.x - 1.5, g.y - 1.5, 3, 3]), edges: [], w: 8, h: 8 };
}

// Triangle: corners 0 (top), 1 (bottom left), 2 (bottom right); midpoints 3 (left), 4 (right), 5 (bottom).
// Side sums are printed outside the sides.
export function triangleFigure() {
    const circles = [[5, 1], [1, 7], [9, 7], [3, 4], [7, 4], [5, 7]].map(([x, y]) => ({ x, y }));
    const groups = [{ ids: [0, 3, 1], x: 1.4, y: 3 }, { ids: [0, 4, 2], x: 8.6, y: 3 }, { ids: [1, 5, 2], x: 5, y: 9.4 }];
    return { circles, groups, rects: [], edges: [[5, 1, 1, 7], [1, 7, 9, 7], [9, 7, 5, 1]], w: 10, h: 10 };
}

// Ways to fill the hidden circles with distinct unused numbers from 1..n so every group sum holds.
export function countSolutions(circles, groups, n, limit = 2) {
    const value = circles.map(c => (c.hidden ? null : c.value));
    const used = new Set(value.filter(v => v !== null));
    const pool = [...Array(n).keys()].map(i => i + 1).filter(v => !used.has(v));
    const hidden = circles.map((c, i) => (c.hidden ? i : -1)).filter(i => i >= 0);
    const taken = pool.map(() => false);
    let count = 0;
    const ok = () => groups.every(g => g.ids.some(i => value[i] === null) || g.ids.reduce((s, i) => s + value[i], 0) === g.sum);
    (function place(k) {
        if (count >= limit) return;
        if (k === hidden.length) { count++; return; }
        pool.forEach((v, j) => {
            if (taken[j]) return;
            taken[j] = true; value[hidden[k]] = v;
            if (ok()) place(k + 1);
            taken[j] = false; value[hidden[k]] = null;
        });
    })(0);
    return count;
}

function makeProblem(figure, n, hiddenMode) {
    const build = () => (figure === 'row' ? rowFigure(getRandomInt(2, n >= 10 ? 4 : 3)) : figure === 'block' ? blockFigure() : triangleFigure());
    // The block needs 9 numbers; any set is at least as big as the figure.
    const N = Math.max(n, figure === 'block' ? 9 : 0);
    let [lo, hi] = hiddenMode === 'few' ? [3, 4] : [5, 6];
    for (let tries = 0; ; tries++) {
        // ponytail: random search; when a size keeps failing step the hidden count down (never below 3).
        // Short rows and the triangle have too few sums for 5–6 hidden circles, so "many" gives 4 there.
        if (tries && tries % MAX_TRIES === 0) { if (lo === 3 && hi === 3) throw new Error('No corner-sums figure found.'); hi = Math.max(3, hi - 1); lo = Math.min(lo, hi); }
        const f = build();
        const values = shuffleArray([...Array(N).keys()].map(i => i + 1)).slice(0, f.circles.length);
        f.circles.forEach((c, i) => { c.value = values[i]; c.hidden = false; });
        f.groups.forEach(g => { g.sum = g.ids.reduce((s, i) => s + values[i], 0); });
        const k = Math.min(getRandomInt(lo, hi), f.circles.length - 2);
        shuffleArray([...f.circles.keys()]).slice(0, k).forEach(i => { f.circles[i].hidden = true; });
        if (countSolutions(f.circles, f.groups, N) !== 1) continue;
        return { figure, n: N, ...f };
    }
}

export function generateCornerSumsData({ figure, numberSet, hidden: hiddenMode, numberOfProblems, translations: t }) {
    if (!FIGURES.includes(figure)) throw new Error('Invalid figure.');
    if (!NUMBER_SETS.includes(numberSet)) throw new Error('Invalid number set.');
    if (!HIDDEN.includes(hiddenMode)) throw new Error('Invalid hidden mode.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: figures take room; cap at 20 per sheet.
    const count = Math.min(20, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const kind = figure === 'mixed' ? ['row', 'block', 'triangle'][i % 3] : figure;
        const p = makeProblem(kind, Number(numberSet), hiddenMode);
        p.star = getRandomFromArray(p.circles.map((c, j) => (c.hidden ? j : -1)).filter(j => j >= 0));
        p.controlSum = digitalRoot(p.circles[p.star].value);
        const rule = kind === 'triangle' ? t.templates.rule_triangle : t.templates.rule_squares;
        const use = p.n === p.circles.length ? t.templates.use_all : t.templates.use_some;
        p.text = `${rule} ${fillTemplate(use, { n: p.n })}`;
        problems.push(p);
    }
    const shuffled = figure === 'mixed' ? shuffleArray(problems) : problems;
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
