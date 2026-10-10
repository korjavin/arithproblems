import assert from 'assert';
import fs from 'fs';
import { generateCubeBuildingsData, TYPES, GRID_SIZES, MAX_HEIGHTS, SHAPES } from './generators/cube-buildings.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8'))]));
const gen = (types, gridSize = 3, maxHeight = 3, lang = 'en', numberOfProblems = 30) =>
    generateCubeBuildingsData({ types, gridSize, maxHeight, numberOfProblems, translations: LOCALES[lang].script.cube_buildings });

// Reference voxel model: (r, c, z) for every cube of a plan.
const voxels = (plan) => plan.flatMap((row, r) => row.flatMap((h, c) => Array.from({ length: h }, (_, z) => [r, c, z])));
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
function voxelStats(plan) {
    const vs = voxels(plan);
    const set = new Set(vs.map(v => v.join()));
    let exposed = 0, contacts = 0;
    for (const [r, c, z] of vs) {
        for (const [dr, dc, dz] of DIRS) {
            const n = [r + dr, c + dc, z + dz];
            if (set.has(n.join())) contacts++;
            else if (n[2] >= 0) exposed++; // the bottom face on the table is not painted
        }
    }
    const project = (f) => new Set(vs.map(f)).size;
    return {
        count: vs.length, exposed, glued: contacts / 2,
        front: project(([, c, z]) => `${c},${z}`), side: project(([r, , z]) => `${r},${z}`), top: project(([r, c]) => `${r},${c}`),
    };
}
// Painted n×n×n cube by iterating the lattice.
function paintedStats(n) {
    const byFaces = [0, 0, 0, 0];
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
        byFaces[[x, y, z].filter(v => v === 0 || v === n - 1).length]++;
    }
    return { total: n ** 3, three_two: byFaces[3] + byFaces[2], one: byFaces[1], zero: byFaces[0], surface: 6 * n * n, visible: n ** 3 - byFaces[0] };
}
assert.deepStrictEqual(paintedStats(3), { total: 27, three_two: 20, one: 6, zero: 1, surface: 54, visible: 26 });
// Pyramid layers as squares of side s(i), counted cube by cube.
const layerSide = (kind, i) => (kind === 'odd' ? 2 * i - 1 : i);
const pyramid = (kind, k) => { let n = 0; for (let i = 1; i <= k; i++) for (let a = 0; a < layerSide(kind, i) ** 2; a++) n++; return n; };
assert.strictEqual(pyramid('odd', 3), 35); // 650434: 1 + 9 + 25
// Staircase: column i (1-based) is i cubes high, d deep.
const stairs = (n, d) => { let k = 0; for (let i = 1; i <= n; i++) for (let z = 0; z < i; z++) for (let y = 0; y < d; y++) k++; return k; };

// Hand-checked plan: back row 2 1, front row 3 1.
const sample = voxelStats([[2, 1], [3, 1]]);
assert.deepStrictEqual(sample, { count: 7, exposed: 22, glued: 8, front: 4, side: 5, top: 4 });

function expected(p) {
    const d = p.data;
    if (p.plan && !p.kind) {
        assert.strictEqual(p.plan.length, p.plan[0].length);
        const s = voxelStats(p.plan), top = Math.max(...p.plan.flat()), size = p.plan.length;
        if (p.variant === 'cube') assert.strictEqual(d.n, Math.max(size, top));
        return {
            count: s.count, cuboid: size * size * top - s.count, cube: d.n ** 3 - s.count, faces: s.exposed, glued: s.glued,
            view_front: s.front, view_left: s.side, view_right: s.side, view_top: s.top,
        }[p.variant];
    }
    if (p.kind) {
        assert.strictEqual(voxels(p.plan).length, pyramid(p.kind, 3), 'plan shows the 3-layer pyramid');
        assert.strictEqual(p.plan.length, layerSide(p.kind, 3));
        if (p.variant === 'pyramid_count') return pyramid(p.kind, d.k);
        if (p.variant === 'pyramid_missing') return layerSide(p.kind, d.k) ** 2 * d.k - pyramid(p.kind, d.k);
        let k = 0;
        while (pyramid(p.kind, k + 1) <= d.m) k++;
        return k;
    }
    if (p.variant === 'stairs' || p.variant === 'stairs_add') {
        assert(p.stairs >= 2 && p.stairs <= 6 && d.d >= 1 && d.d <= 3);
        return p.variant === 'stairs' ? stairs(p.stairs, d.d) : stairs(p.stairs + 2, d.d) - stairs(p.stairs, d.d);
    }
    if (p.variant === 'tower') {
        let h = 1;
        while (4 * h + 1 < d.f) h++;
        assert.strictEqual(4 * h + 1, d.f);
        return h;
    }
    if (p.variant.startsWith('painted_')) {
        assert(d.n >= 3 && d.n <= 5);
        return paintedStats(d.n)[p.variant.slice('painted_'.length)];
    }
    const shapeKey = Object.keys(SHAPES).find(k => LOCALES.en.script.cube_buildings.shapes[k] === d.shape);
    switch (p.variant) {
        case 'models_edges': return d.m * SHAPES[shapeKey].edges;
        case 'models_vertices': return d.m * SHAPES[shapeKey].vertices;
        case 'wire_cube': assert((d.l - d.r) % 12 === 0 && d.r < 12); return (d.l - d.r) / 12;
        case 'wire_cuboid': return 4 * (d.a + d.b + d.c);
        case 'volume': return 12 * Math.round(Math.cbrt(d.v));
        case 'trap': assert.strictEqual(d.ke, d.k * d.e); return SHAPES[shapeKey].edges;
    }
    throw new Error(`unknown variant ${p.variant}`);
}

assert.deepStrictEqual(SHAPES.tri_pyramid, { edges: 6, vertices: 4 });
const seen = new Set();
for (const gridSize of GRID_SIZES) for (const maxHeight of MAX_HEIGHTS) {
    for (const type of TYPES) {
        for (let round = 0; round < 10; round++) {
            const { problems, controlSums } = gen([type], gridSize, maxHeight);
            assert.strictEqual(problems.length, 30);
            problems.forEach((p, i) => {
                seen.add(p.variant);
                assert.strictEqual(p.type, type);
                assert(p.answer >= 1, `${p.variant} answer ${p.answer}`);
                assert.strictEqual(p.answer, expected(p), `${p.variant} ${JSON.stringify(p)}`);
                if (p.plan && !p.kind) p.plan.flat().forEach(h => assert(h >= 1 && h <= maxHeight));
                assert.strictEqual(controlSums[i].controlSum, digitalRoot(p.answer));
                assert(controlSums[i].controlSum >= 0 && controlSums[i].controlSum <= 9);
                assert(!/\{\w+\}/.test(p.text), `unfilled template: ${p.text}`);
            });
        }
    }
}
const VARIANTS = ['count', 'cuboid', 'cube', 'tower', 'faces', 'glued', 'view_front', 'view_left', 'view_right', 'view_top', 'stairs', 'stairs_add',
    'pyramid_count', 'pyramid_missing', 'pyramid_max', ...['total', 'three_two', 'one', 'zero', 'surface', 'visible'].map(v => `painted_${v}`),
    'models_edges', 'models_vertices', 'wire_cube', 'wire_cuboid', 'volume', 'trap'];
VARIANTS.forEach(v => assert(seen.has(v), `variant ${v} never generated`));

// Every language has every template, shape, depth and label.
for (const [lang, loc] of Object.entries(LOCALES)) {
    const t = loc.script.cube_buildings;
    assert(loc.cube_buildings_h3 && loc.cube_buildings_p, `${lang} menu`);
    [...VARIANTS, 'pyramid_odd', 'pyramid_square'].forEach(v => assert(t.templates[v], `${lang} template ${v}`));
    Object.keys(SHAPES).forEach(s => assert(t.shapes[s], `${lang} shape ${s}`));
    assert.strictEqual(t.depths.length, 3);
    TYPES.forEach(x => assert(t[`type_${x}_label`], `${lang} label ${x}`));
    ['grid_size_label', 'max_height_label', 'description', 'problems_title', 'answer_label', 'plan_hint', 'front_label',
        'control_sum_grid_title', 'control_sum_grid_subtitle', 'error_message'].forEach(k => assert(t[k], `${lang} ${k}`));
    const { problems } = gen(TYPES, 4, 5, lang);
    problems.forEach(p => assert(!/\{\w+\}/.test(p.text), `${lang} unfilled: ${p.text}`));
}

// Mixed sheet uses every type; bad input throws.
const mixed = gen(TYPES, 3, 3, 'en', 18);
assert.strictEqual(mixed.problems.length, 18);
assert.deepStrictEqual(new Set(mixed.problems.map(p => p.type)), new Set(TYPES));
assert.strictEqual(gen(TYPES, 3, 3, 'en', 100).problems.length, 30);
assert.throws(() => gen([]));
assert.throws(() => gen(TYPES, 7));
assert.throws(() => gen(TYPES, 3, 9));

console.log('cube-buildings tests passed');
