import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

// Cube buildings (olympiad CUBE): a building is a height map h[r][c] on a plan
// (row 0 = back, last row = front, columns left to right as seen from the front;
// every cell holds 1..maxHeight cubes, no overhangs). Staircases, pyramids,
// painted n×n×n cubes and edge models are formula problems.
// Self-check digit: digitalRoot(answer).
export const TYPES = ['count', 'complete', 'faces', 'glued', 'views', 'stairs', 'pyramid', 'painted', 'edges'];
export const GRID_SIZES = [2, 3, 4];
export const MAX_HEIGHTS = [3, 4, 5];

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const cells = (h) => h.flat();
export const cubeCount = (h) => sum(cells(h));
// Cube-to-cube contacts: stacked pairs plus side neighbours (shared height).
export function gluedFaces(h) {
    let n = sum(cells(h).map(x => Math.max(0, x - 1)));
    h.forEach((row, r) => row.forEach((x, c) => {
        if (c + 1 < row.length) n += Math.min(x, row[c + 1]);
        if (r + 1 < h.length) n += Math.min(x, h[r + 1][c]);
    }));
    return n;
}
// Faces not glued to a cube and not on the table: 6 per cube − 2 per contact − bottoms.
export const paintedFaces = (h) => 6 * cubeCount(h) - 2 * gluedFaces(h) - cells(h).filter(x => x > 0).length;
export const frontSquares = (h) => sum(h[0].map((_, c) => Math.max(...h.map(row => row[c]))));
export const sideSquares = (h) => sum(h.map(row => Math.max(...row)));

function randomPlan(gridSize, maxHeight) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => getRandomInt(1, maxHeight)));
}

// Square pyramid layers from the top: odd squares 1, 9, 25 … or squares 1, 4, 9 …
const layerSide = (kind, i) => (kind === 'odd' ? 2 * i - 1 : i);
const pyramidCubes = (kind, k) => sum(range(1, k).map(i => layerSide(kind, i) ** 2));
// Plan of a 3-layer pyramid (centred for odd squares, corner-aligned for squares).
function pyramidPlan(kind) {
    const s = layerSide(kind, 3);
    return range(0, s - 1).map(r => range(0, s - 1).map(c => (kind === 'odd' ? 3 - Math.max(Math.abs(r - 2), Math.abs(c - 2)) : 3 - Math.max(r, c))));
}

export const SHAPES = { cube: { edges: 12, vertices: 8 }, cuboid: { edges: 12, vertices: 8 }, tri_pyramid: { edges: 6, vertices: 4 }, square_pyramid: { edges: 8, vertices: 5 } };

const MAKERS = {
    count: ({ plan }) => ({ variant: 'count', plan, answer: cubeCount(plan) }),

    complete({ plan }) {
        const rows = plan.length, cols = plan[0].length, top = Math.max(...cells(plan));
        const variants = [{ variant: 'cuboid', answer: rows * cols * top - cubeCount(plan) }];
        const n = Math.max(rows, cols, top);
        variants.push({ variant: 'cube', data: { n }, answer: n ** 3 - cubeCount(plan) });
        const pick = getRandomFromArray(variants.filter(v => v.answer >= 1));
        return pick && { data: {}, ...pick, plan };
    },

    faces({ plan }) {
        if (getRandomInt(0, 3) === 0) {
            const height = getRandomInt(2, 12);
            return { variant: 'tower', data: { f: 4 * height + 1 }, answer: height };
        }
        return { variant: 'faces', plan, answer: paintedFaces(plan) };
    },

    glued: ({ plan }) => ({ variant: 'glued', plan, answer: gluedFaces(plan) }),

    views({ plan }) {
        const side = getRandomFromArray(['front', 'left', 'right', 'top']);
        const answer = side === 'front' ? frontSquares(plan) : side === 'top' ? cells(plan).length : sideSquares(plan);
        return { variant: `view_${side}`, plan, answer };
    },

    stairs(_, t) {
        const n = getRandomInt(2, 6), d = getRandomInt(1, 3);
        const steps = (k) => (d * k * (k + 1)) / 2;
        const data = { d, depth: t.depths[d - 1] };
        return getRandomInt(0, 1)
            ? { variant: 'stairs', stairs: n, data, answer: steps(n) }
            : { variant: 'stairs_add', stairs: n, data, answer: steps(n + 2) - steps(n) };
    },

    pyramid() {
        const kind = getRandomFromArray(['odd', 'square']);
        const variant = getRandomFromArray(['pyramid_count', 'pyramid_missing', 'pyramid_max']);
        const base = { kind, intro: `pyramid_${kind}`, plan: pyramidPlan(kind) };
        if (variant === 'pyramid_max') {
            const k = getRandomInt(2, kind === 'odd' ? 5 : 7);
            const m = getRandomInt(pyramidCubes(kind, k), pyramidCubes(kind, k + 1) - 1);
            return { ...base, variant, data: { m }, answer: k };
        }
        const k = getRandomInt(4, kind === 'odd' ? 6 : 8);
        const s = layerSide(kind, k);
        const answer = variant === 'pyramid_count' ? pyramidCubes(kind, k) : s * s * k - pyramidCubes(kind, k);
        return { ...base, variant, data: { k }, answer };
    },

    painted() {
        const n = getRandomInt(3, 5), i = n - 2;
        const variant = getRandomFromArray(['total', 'three_two', 'one', 'zero', 'surface', 'visible']);
        const answer = { total: n ** 3, three_two: 8 + 12 * i, one: 6 * i * i, zero: i ** 3, surface: 6 * n * n, visible: n ** 3 - i ** 3 }[variant];
        return { variant: `painted_${variant}`, data: { n }, answer };
    },

    edges(_, t) {
        const variant = getRandomFromArray(['models', 'wire_cube', 'wire_cuboid', 'volume', 'trap']);
        const shapeKey = getRandomFromArray(Object.keys(SHAPES));
        const shape = t.shapes[shapeKey];
        if (variant === 'models') {
            const m = getRandomInt(2, 5), part = getRandomFromArray(['edges', 'vertices']);
            return { variant: `models_${part}`, data: { m, shape }, answer: m * SHAPES[shapeKey][part] };
        }
        if (variant === 'wire_cube') {
            const e = getRandomInt(3, 8), r = getRandomInt(1, 9);
            return { variant, data: { l: 12 * e + r, r }, answer: e };
        }
        if (variant === 'wire_cuboid') {
            const [a, b, c] = shuffleArray(range(2, 9)).slice(0, 3);
            return { variant, data: { a, b, c }, answer: 4 * (a + b + c) };
        }
        // ponytail: volume ×8 or ×27 only (ru "в 64 раза" would need another plural form).
        if (variant === 'volume') { const k = getRandomInt(2, 3); return { variant, data: { v: k ** 3 }, answer: 12 * k }; }
        const k = getRandomInt(2, 4);
        const e = getRandomInt(2, 6);
        return { variant, data: { shape, e, k, ke: k * e }, answer: SHAPES[shapeKey].edges };
    },
};

export function generateCubeBuildingsData({ types, gridSize, maxHeight, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!GRID_SIZES.includes(gridSize)) throw new Error('Invalid plan size.');
    if (!MAX_HEIGHTS.includes(maxHeight)) throw new Error('Invalid maximum height.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: prose sheet; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        let p = null;
        for (let tries = 0; !p && tries < 100; tries++) p = MAKERS[type]({ plan: randomPlan(gridSize, maxHeight) }, t);
        if (!p) throw new Error(`No ${type} problem found.`);
        p = { type, data: {}, ...p };
        p.text = [p.intro, p.variant].filter(Boolean).map(key => fillTemplate(t.templates[key], p.data)).join(' ');
        p.controlSum = digitalRoot(p.answer);
        problems.push(p);
    }
    const shuffled = shuffleArray(problems);
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
