import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

// Magic squares with missing cells (3×3, 4×4) and the 2×2 "Rechenviereck"
// (corner numbers, the sums of neighbouring corners in the middle boxes).
// A problem is { kind, grid (full values, null = no box), hidden (bool grid),
// star [r, c] (one hidden cell) }. Self-check digit: digitalRoot(value in ★).
export const SIZES = ['3', '4', '2', 'mixed'];
export const HIDDEN = ['few', 'many'];
export const SUM_MODES = ['show', 'hide'];
const MAX_TRIES = 2000;

// Rows, columns and both diagonals of an n×n square, as lists of [r, c].
export function lines(n) {
    const idx = [...Array(n).keys()];
    return [
        ...idx.map(r => idx.map(c => [r, c])),
        ...idx.map(c => idx.map(r => [r, c])),
        idx.map(i => [i, i]),
        idx.map(i => [i, n - 1 - i]),
    ];
}

export const isMagic = (grid) => {
    const sums = lines(grid.length).map(l => l.reduce((s, [r, c]) => s + grid[r][c], 0));
    return sums.every(s => s === sums[0]);
};

// Every 3×3 magic square: centre c, magic sum 3c.
export const square3 = (c, a, b) => [[c + a, c - a - b, c + b], [c - a + b, c, c + a - b], [c - b, c + a + b, c - a]];

const distinctPositive = (grid) => {
    const v = grid.flat();
    return v.every(x => x > 0) && new Set(v).size === v.length;
};

const pickHidden = (n, k) => {
    const cells = shuffleArray([...Array(n * n).keys()]).slice(0, k);
    return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => cells.includes(r * n + c)));
};

const hasCompleteLine = (hidden) => lines(hidden.length).some(l => l.every(([r, c]) => !hidden[r][c]));
const hiddenCells = (hidden) => hidden.flatMap((row, r) => row.map((h, c) => (h ? [r, c] : null))).filter(Boolean);

// 3×3: fill cells the way a student would — a line with one gap once the sum
// is known; the sum from a full line or 3 × centre; the centre from sum / 3.
// Solved by these steps ⇒ unique (the test re-checks by brute force).
export function solvable3(grid, hidden, showSum) {
    const known = hidden.map(row => row.map(h => !h));
    let sum = showSum ? 3 * grid[1][1] : null;
    for (let changed = true; changed;) {
        changed = false;
        if (sum === null && known[1][1]) { sum = 3 * grid[1][1]; changed = true; }
        if (sum === null && lines(3).some(l => l.every(([r, c]) => known[r][c]))) { sum = 3 * grid[1][1]; changed = true; }
        if (sum === null) continue;
        if (!known[1][1]) { known[1][1] = true; changed = true; }
        lines(3).forEach(l => {
            const gaps = l.filter(([r, c]) => !known[r][c]);
            if (gaps.length === 1) { known[gaps[0][0]][gaps[0][1]] = true; changed = true; }
        });
    }
    return known.flat().every(Boolean);
}

// 4×4: count the ways to put the hidden numbers back so that every line has the magic sum.
export function countFillings4(grid, hidden, limit = 2) {
    const cells = hiddenCells(hidden);
    const values = cells.map(([r, c]) => grid[r][c]);
    const sum = grid[0].reduce((a, b) => a + b, 0);
    const g = grid.map((row, r) => row.map((v, c) => (hidden[r][c] ? null : v)));
    const ls = lines(4);
    const used = values.map(() => false);
    let count = 0;
    const ok = () => ls.every(l => l.some(([r, c]) => g[r][c] === null) || l.reduce((s, [r, c]) => s + g[r][c], 0) === sum);
    (function place(i) {
        if (count >= limit) return;
        if (i === cells.length) { count++; return; }
        const [r, c] = cells[i];
        values.forEach((v, j) => {
            if (used[j]) return;
            used[j] = true; g[r][c] = v;
            if (ok()) place(i + 1);
            used[j] = false; g[r][c] = null;
        });
    })(0);
    return count;
}

// 1..16 row-wise with both diagonals reversed, then random symmetries and an offset.
export function square4(offset) {
    let g = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => (r === c || r + c === 3 ? 16 - (4 * r + c) : 4 * r + c + 1)));
    const permute = (p) => { g = p.map(r => p.map(c => g[r][c])); };
    if (getRandomInt(0, 1)) permute([0, 2, 1, 3]); // inner rows and columns
    if (getRandomInt(0, 1)) permute([1, 0, 3, 2]); // outer with inner
    for (let i = getRandomInt(0, 3); i > 0; i--) g = g.map((row, r) => row.map((_, c) => g[3 - c][r])); // rotate
    if (getRandomInt(0, 1)) g = g.map(row => [...row].reverse()); // mirror
    return g.map(row => row.map(v => v + offset));
}

function makeMagic(n, hiddenMode, showSum) {
    for (let tries = 0; tries < MAX_TRIES; tries++) {
        let grid;
        if (n === 3) {
            const c = getRandomInt(5, 40);
            const a = getRandomInt(1 - c, c - 1), b = getRandomInt(1 - c, c - 1);
            grid = square3(c, a, b);
            if (!distinctPositive(grid)) continue;
        } else {
            grid = square4(getRandomInt(0, 20));
        }
        const k = n === 3 ? (hiddenMode === 'few' ? getRandomInt(3, 4) : getRandomInt(5, 6)) : (hiddenMode === 'few' ? getRandomInt(4, 5) : getRandomInt(6, 8));
        const hidden = pickHidden(n, k);
        if (!showSum && !hasCompleteLine(hidden)) continue;
        if (n === 3 ? !solvable3(grid, hidden, showSum) : countFillings4(grid, hidden) !== 1) continue;
        return { grid, hidden, magicSum: grid[0].reduce((s, v) => s + v, 0) };
    }
    throw new Error('No magic square found.');
}

// Rechenviereck as a 3×3 layout: corners are the numbers, middle boxes the sums, no centre box.
export function rechenviereck(a, b, c, d) {
    return [[a, a + b, b], [a + c, null, b + d], [c, c + d, d]];
}

function makeRechenviereck(hiddenMode) {
    const [a, b, c, d] = Array.from({ length: 4 }, () => getRandomInt(1, 30));
    const grid = rechenviereck(a, b, c, d);
    // Four sums of a 4-cycle say only three things, so one corner always stays: three corners
    // hidden (few) plus one sum (many) — the path of the remaining sums still reaches every corner.
    const corners = shuffleArray([[0, 0], [0, 2], [2, 0], [2, 2]]).slice(0, 3);
    const sums = hiddenMode === 'many' ? [getRandomFromArray([[0, 1], [1, 0], [1, 2], [2, 1]])] : [];
    const hidden = grid.map(row => row.map(() => false));
    [...corners, ...sums].forEach(([r, col]) => { hidden[r][col] = true; });
    return { grid, hidden };
}

export function generateMagicSquaresData({ size, hidden: hiddenMode, magicSumMode, numberOfProblems, translations: t }) {
    if (!SIZES.includes(size)) throw new Error('Invalid square size.');
    if (!HIDDEN.includes(hiddenMode)) throw new Error('Invalid hidden mode.');
    if (!SUM_MODES.includes(magicSumMode)) throw new Error('Invalid magic sum mode.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: squares take room; cap at 20 per sheet.
    const count = Math.min(20, numberOfProblems);
    const showSum = magicSumMode === 'show';
    const problems = [];
    for (let i = 0; i < count; i++) {
        const kind = size === 'mixed' ? ['3', '4', '2'][i % 3] : size;
        const p = kind === '2' ? makeRechenviereck(hiddenMode) : makeMagic(Number(kind), hiddenMode, showSum);
        p.kind = kind;
        p.showSum = kind !== '2' && showSum;
        p.star = getRandomFromArray(hiddenCells(p.hidden));
        p.controlSum = digitalRoot(p.grid[p.star[0]][p.star[1]]);
        const parts = kind === '2' ? [t.templates.rechenviereck]
            : [p.showSum ? fillTemplate(t.templates.sum_given, { s: p.magicSum }) : t.templates.sum_hidden];
        if (kind === '4') {
            p.hiddenNumbers = hiddenCells(p.hidden).map(([r, c]) => p.grid[r][c]).sort((x, y) => x - y);
            parts.push(fillTemplate(t.templates.use_numbers, { list: p.hiddenNumbers.join(', ') }));
        }
        p.text = parts.join(' ');
        problems.push(p);
    }
    const shuffled = size === 'mixed' ? shuffleArray(problems) : problems;
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
