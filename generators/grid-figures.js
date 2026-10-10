import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

// Figures made of unit squares on squared paper: perimeter, area, corners,
// staircases, glued squares and comparisons. A figure is a list of cells
// [x, y] (y grows downwards, like SVG). Pictures are inline SVGs whose viewBox
// is in cell units, so print (styles/print-grid.css) can size one figure cell
// to exactly one paper cell. Self-check digit: digitalRoot(answer), the double
// area when an area has half squares, the letter index (A = 1) for comparisons.
export const TYPES = ['perimeter', 'area', 'corners', 'staircase', 'glued', 'compare'];
export const SIZES = [4, 5, 6, 7, 8];
export const LETTERS = ['A', 'B', 'C', 'D'];
const MAX_TRIES = 1000;
const PX = 18; // screen pixels per cell
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const key = (x, y) => `${x},${y}`;
const cellSet = (cells) => new Set(cells.map(([x, y]) => key(x, y)));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const bbox = (cells) => {
    const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs) + 1, y1: Math.max(...ys) + 1 };
};

// Unit edges of the cells that have no neighbouring cell.
export function perimeter(cells) {
    const s = cellSet(cells);
    return cells.reduce((n, [x, y]) => n + DIRS.filter(([dx, dy]) => !s.has(key(x + dx, y + dy))).length, 0);
}

// Filled cells of the 2×2 block around grid point (x, y): [top-left, top-right, bottom-left, bottom-right].
const around = (s, x, y) => [key(x - 1, y - 1), key(x, y - 1), key(x - 1, y), key(x, y)].map(k => s.has(k));
const gridPoints = (cells) => [...new Set(cells.flatMap(([x, y]) => [key(x, y), key(x + 1, y), key(x, y + 1), key(x + 1, y + 1)]))]
    .map(p => p.split(',').map(Number));

// Vertices of the outline: grid points where the 2×2 block holds 1 or 3 cells.
export function cornerCount(cells) {
    const s = cellSet(cells);
    return gridPoints(cells).filter(([x, y]) => around(s, x, y).filter(Boolean).length % 2 === 1).length;
}

// No holes (every empty cell of the bounding frame reaches its border) and no
// two cells touching only at a corner, so the outline is one simple polygon.
export function isSimple(cells) {
    const s = cellSet(cells);
    const pinch = gridPoints(cells).some(([x, y]) => {
        const [a, b, c, d] = around(s, x, y);
        return (a && d && !b && !c) || (b && c && !a && !d);
    });
    if (pinch) return false;
    const { x0, y0, x1, y1 } = bbox(cells);
    const inFrame = (x, y) => x >= x0 - 1 && x <= x1 && y >= y0 - 1 && y <= y1;
    const seen = new Set([key(x0 - 1, y0 - 1)]);
    const stack = [[x0 - 1, y0 - 1]];
    while (stack.length) {
        const [x, y] = stack.pop();
        DIRS.forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy, k = key(nx, ny);
            if (inFrame(nx, ny) && !s.has(k) && !seen.has(k)) { seen.add(k); stack.push([nx, ny]); }
        });
    }
    return seen.size === (x1 - x0 + 2) * (y1 - y0 + 2) - cells.length;
}

// Random growth from the centre cell of a size×size field; connected by construction.
function growFigure(size, count) {
    for (let tries = 0; tries < MAX_TRIES; tries++) {
        const c = Math.floor((size - 1) / 2);
        const cells = [[c, c]];
        const s = new Set([key(c, c)]);
        while (cells.length < count) {
            const [x, y] = getRandomFromArray(cells);
            const [dx, dy] = getRandomFromArray(DIRS);
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= size || ny >= size || s.has(key(nx, ny))) continue;
            cells.push([nx, ny]);
            s.add(key(nx, ny));
        }
        if (isSimple(cells)) return cells;
    }
    throw new Error('No figure found.');
}

const randomCount = (size) => getRandomInt(Math.max(4, size), Math.floor(size * size / 2));

// The side of cell (x, y) towards (dx, dy), as [x1, y1, x2, y2] with the smaller end first.
function cellEdge(x, y, dx, dy) {
    if (dx === 1) return [x + 1, y, x + 1, y + 1];
    if (dx === -1) return [x, y, x, y + 1];
    if (dy === 1) return [x, y + 1, x + 1, y + 1];
    return [x, y, x + 1, y];
}

function outlineSegments(cells, skip = new Set()) {
    const s = cellSet(cells);
    return cells.flatMap(([x, y]) => DIRS.filter(([dx, dy]) => !s.has(key(x + dx, y + dy)))
        .map(([dx, dy]) => cellEdge(x, y, dx, dy)).filter(e => !skip.has(e.join(','))));
}

// Half squares: empty cells next to exactly one figure cell, cut along a
// diagonal so that the grey half leans on that figure cell. No two halves are
// side neighbours, so every half's free leg is on the outline.
function addHalves(cells, size, k) {
    const s = cellSet(cells);
    const candidates = shuffleArray(range(0, size * size - 1).map(i => [i % size, Math.floor(i / size)])
        .filter(([x, y]) => !s.has(key(x, y)) && DIRS.filter(([dx, dy]) => s.has(key(x + dx, y + dy))).length === 1));
    const halves = [];
    for (const [x, y] of candidates) {
        if (halves.length === k) break;
        if (halves.some(h => Math.abs(h.x - x) + Math.abs(h.y - y) === 1)) continue;
        const [dx, dy] = DIRS.find(([ddx, ddy]) => s.has(key(x + ddx, y + ddy)));
        const edge = cellEdge(x, y, dx, dy);
        const e1 = [edge[0], edge[1]], e2 = [edge[2], edge[3]];
        const far = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].filter(p => !(p[0] === e1[0] && p[1] === e1[1]) && !(p[0] === e2[0] && p[1] === e2[1]));
        const f = getRandomFromArray(far);
        halves.push({ x, y, shared: edge.join(','), points: [e1, e2, f], segments: [[...e1, ...f], [...e2, ...f]] });
    }
    return halves;
}

// Inline SVG in cell units. Grid lines (class gf-grid) are for the screen only;
// print hides them because the paper already has them.
function svg({ x0 = 0, y0 = 0, w, h, grid, cells = [], polygons = [], segments = [], texts = [] }) {
    const lines = grid ? [
        ...range(grid.x0, grid.x1).map(x => `M${x} ${grid.y0}V${grid.y1}`),
        ...range(grid.y0, grid.y1).map(y => `M${grid.x0} ${y}H${grid.x1}`),
    ].join('') : '';
    return `<svg class="gf-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${w} ${h}" width="${w * PX}" height="${h * PX}" style="--w:${w};--h:${h}" shape-rendering="crispEdges">`
        + (lines ? `<path class="gf-grid" d="${lines}" fill="none" stroke="#ccc" stroke-width="0.04"/>` : '')
        + `<g fill="#bbb">${cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')}`
        + `${polygons.map(p => `<polygon points="${p.map(q => q.join(',')).join(' ')}"/>`).join('')}</g>`
        + `<path d="${segments.map(([a, b, c, d]) => `M${a} ${b}L${c} ${d}`).join('')}" fill="none" stroke="#222" stroke-width="0.12" stroke-linecap="round"/>`
        + texts.map(t => `<text x="${t.x}" y="${t.y}" font-size="0.75" text-anchor="${t.anchor || 'middle'}" dominant-baseline="central" fill="#222">${t.s}</text>`).join('')
        + '</svg>';
}

// A figure on its whole size×size field.
const fieldSvg = (cells, size, halves = []) => svg({
    w: size, h: size, grid: { x0: 0, y0: 0, x1: size, y1: size }, cells,
    polygons: halves.map(h => h.points),
    segments: [...outlineSegments(cells, new Set(halves.map(h => h.shared))), ...halves.flatMap(h => h.segments)],
});

// A figure cropped to its bounding box, with its letter in a row above it.
function letteredSvg(cells, letter) {
    const { x0, y0, x1, y1 } = bbox(cells);
    const moved = cells.map(([x, y]) => [x - x0, y - y0]);
    const w = x1 - x0, h = y1 - y0;
    return svg({ y0: -1, w, h: h + 1, grid: { x0: 0, y0: 0, x1: w, y1: h }, cells: moved, segments: outlineSegments(moved), texts: [{ x: 0.5, y: -0.5, s: letter }] });
}

const squareCells = (x0, y0, side) => range(0, side * side - 1).map(i => [x0 + (i % side), y0 + Math.floor(i / side)]);

// Glued squares: 'row' (bottoms aligned, left to right) or 'L' (the largest
// square A, B to its right, C on top of it).
export function gluedCells(layout, sides) {
    if (layout === 'L') {
        const [a, b, c] = sides;
        return [squareCells(0, c, a), squareCells(a, c + a - b, b), squareCells(0, 0, c)];
    }
    const top = Math.max(...sides);
    let x = 0;
    return sides.map(side => { const sq = squareCells(x, top - side, side); x += side; return sq; });
}

const MAKERS = {
    perimeter({ size }) {
        const cells = growFigure(size, randomCount(size));
        return { variant: 'perimeter', cells, answer: perimeter(cells), svg: fieldSvg(cells, size) };
    },

    area({ size, allowHalves }) {
        const cells = growFigure(size, randomCount(size));
        const halves = allowHalves ? addHalves(cells, size, getRandomInt(1, 3)) : [];
        const answer = cells.length + halves.length / 2;
        return { variant: halves.length ? 'area_halves' : 'area', cells, halves, answer, check: halves.length ? 2 * answer : answer, svg: fieldSvg(cells, size, halves) };
    },

    corners({ size }) {
        const cells = growFigure(size, randomCount(size));
        return { variant: 'corners', cells, answer: cornerCount(cells), svg: fieldSvg(cells, size) };
    },

    staircase(_, t) {
        const k = getRandomInt(3, 5), stepWidth = getRandomInt(1, 6), stepHeight = getRandomInt(1, 6);
        const W = k * stepWidth, H = k * stepHeight;
        const variant = getRandomFromArray(['staircase_perimeter', 'staircase_step']);
        // ponytail: drawn not to scale — steps are 1 or 2 cells, so the picture stays small and on the grid.
        const dw = stepWidth > stepHeight ? 2 : 1, dh = stepHeight > stepWidth ? 2 : 1;
        const cells = range(0, k - 1).flatMap(i => range(0, dw - 1).flatMap(j => range(0, (k - i) * dh - 1).map(r => [i * dw + j, k * dh - 1 - r])));
        const wd = k * dw, hd = k * dh;
        const picture = svg({
            x0: -3, w: wd + 3, h: hd + 1, grid: { x0: 0, y0: 0, x1: wd, y1: hd }, cells, segments: outlineSegments(cells),
            texts: [{ x: wd / 2, y: hd + 0.5, s: `${W} ${t.unit_cm}` }, { x: -0.3, y: hd / 2, s: `${H} ${t.unit_cm}`, anchor: 'end' }],
        });
        return { variant, data: { k, W, H }, cells, stepWidth, stepHeight, answer: variant === 'staircase_step' ? stepHeight : 2 * (W + H), svg: picture };
    },

    glued(_, t) {
        const n = getRandomInt(3, 4);
        const layout = n === 3 && getRandomInt(0, 1) ? 'L' : 'row';
        let sides = shuffleArray(range(2, 9)).slice(0, n);
        if (layout === 'L') sides = [Math.max(...sides), ...sides.filter(s => s !== Math.max(...sides))];
        const missing = layout === 'L' ? getRandomInt(1, 2) : getRandomInt(0, n - 1);
        const extent = layout === 'L' && missing === 2 ? { key: 'glued_height', l: sides[0] + sides[2] }
            : { key: 'glued_width', l: layout === 'L' ? sides[0] + sides[1] : sides.reduce((a, b) => a + b, 0) };
        const variant = getRandomFromArray(['glued_side', 'glued_perimeter']);
        const cells = gluedCells(layout, sides).flat();
        // Drawn not to scale: side = 2 + rank, so the order of sizes (and the outline's shape) is kept.
        const sorted = [...sides].sort((a, b) => a - b);
        const drawn = gluedCells(layout, sides.map(s => 2 + sorted.indexOf(s)));
        const all = drawn.flat();
        const { x1, y1 } = bbox(all);
        const picture = svg({
            w: x1, h: y1, grid: { x0: 0, y0: 0, x1, y1 }, cells: all, segments: [...outlineSegments(all), ...drawn.flatMap(sq => outlineSegments(sq))],
            texts: drawn.map((sq, i) => { const b = bbox(sq); return { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, s: LETTERS[i] }; }),
        });
        const text = [
            fillTemplate(t.templates.glued_intro, { names: LETTERS.slice(0, n).join(', ') }),
            ...sides.map((s, i) => (i === missing ? null : fillTemplate(t.templates.glued_given, { s: LETTERS[i], p: 4 * s }))).filter(Boolean),
            fillTemplate(t.templates[extent.key], { l: extent.l }),
            fillTemplate(t.templates[variant], { s: LETTERS[missing] }),
        ].join(' ');
        return { variant, layout, sides, missing, extent, cells, answer: variant === 'glued_side' ? sides[missing] : perimeter(cells), text, svg: picture };
    },

    compare({ size }) {
        const m = getRandomInt(2, 3);
        const measure = getRandomFromArray(['area', 'perimeter']);
        for (let tries = 0; tries < MAX_TRIES; tries++) {
            // Same number of cells when comparing perimeters, so the eye can't just pick the biggest figure.
            const count = randomCount(size);
            const figures = range(1, m).map(() => growFigure(size, measure === 'perimeter' ? count : randomCount(size)));
            const values = figures.map(f => (measure === 'area' ? f.length : perimeter(f)));
            const best = Math.max(...values);
            if (values.filter(v => v === best).length !== 1) continue;
            return {
                variant: `compare_${measure}`, measure, figures, values, answer: values.indexOf(best) + 1,
                svg: figures.map((f, i) => letteredSvg(f, LETTERS[i])).join(''),
            };
        }
        throw new Error('No comparison found.');
    },
};

export function generateGridFiguresData({ types, size, allowHalves = false, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!SIZES.includes(size)) throw new Error('Invalid grid size.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: pictures take room; cap at 20 per sheet.
    const count = Math.min(20, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, ...MAKERS[type]({ size, allowHalves }, t) };
        p.text = p.text || fillTemplate(t.templates[p.variant], p.data || {});
        p.controlSum = digitalRoot(p.check ?? p.answer);
        problems.push(p);
    }
    const shuffled = shuffleArray(problems);
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
