import assert from 'assert';
import fs from 'fs';
import { generateDiceData, TYPES, NETS, UNIQUE_PAIR_SUMS, TIPS, DIRS, tip, START } from './generators/dice.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.dice]));
const gen = (types, lang = 'en', numberOfProblems = 30) => generateDiceData({ types, numberOfProblems, translations: LOCALES[lang] });
const sum = a => a.reduce((s, x) => s + x, 0);

// Fold simulation: roll a cube over the net; each cell gets the cube face lying on it.
// Faces 0..5 with 0|1, 2|3, 4|5 opposite. Returns opp[i] or throws if the net does not fold.
const ROLL = {
    '1,0': s => ({ ...s, B: s.E, E: s.T, T: s.W, W: s.B }),
    '-1,0': s => ({ ...s, B: s.W, W: s.T, T: s.E, E: s.B }),
    '0,1': s => ({ ...s, B: s.S, S: s.T, T: s.N, N: s.B }),
    '0,-1': s => ({ ...s, B: s.N, N: s.T, T: s.S, S: s.B }),
};
function fold(cells) {
    const face = new Array(cells.length);
    const go = (i, s) => {
        face[i] = s.B;
        cells.forEach(([x, y], j) => {
            const step = ROLL[`${x - cells[i][0]},${y - cells[i][1]}`];
            if (face[j] === undefined && step) go(j, step(s));
        });
    };
    go(0, { B: 0, T: 1, N: 2, S: 3, E: 4, W: 5 });
    assert.strictEqual(new Set(face).size, 6, `net does not fold: ${JSON.stringify(cells)}`);
    return face.map(f => face.indexOf(f ^ 1));
}

// The 11 nets: distinct up to rotation/reflection, each folds, hard-coded opposites match the fold.
assert.strictEqual(NETS.length, 11);
const canon = cells => {
    const forms = [];
    for (let r = 0; r < 8; r++) {
        let c = cells.map(([x, y]) => [r & 1 ? y : x, r & 1 ? x : y]).map(([x, y]) => [r & 2 ? -x : x, r & 4 ? -y : y]);
        const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1]));
        forms.push(c.map(([x, y]) => `${x - mx},${y - my}`).sort().join(' '));
    }
    return forms.sort()[0];
};
assert.strictEqual(new Set(NETS.map(n => canon(n.cells))).size, 11);
NETS.forEach(n => assert.deepStrictEqual(fold(n.cells), n.opp));

// Inverse uniqueness: for these sums exactly one unordered pair a ≠ b.
const pairs = s => { const r = []; for (let a = 1; a <= 6; a++) for (let b = a + 1; b <= 6; b++) if (a + b === s) r.push([a, b]); return r; };
for (let s = 2; s <= 12; s++) assert.strictEqual(pairs(s).length === 1, UNIQUE_PAIR_SUMS.includes(s), `sum ${s}`);

// Dice glued one after another: visible = Σ over dice of (21 − pips on its glued faces).
const chainVisible = (k, contacts) => {
    const glued = Array.from({ length: k }, () => []);
    contacts.forEach(c => { glued[c.a - 1].push(c.x); glued[c.b - 1].push(c.y); });
    glued.forEach(g => assert.ok(g.length < 2 || g[0] !== g[1], 'a die glues two different faces'));
    return sum(glued.map(g => 21 - sum(g)));
};

// Tipping model, re-checked with axis vectors: positions top, bottom, front, back, right, left.
const AXES = [[0, 0, 1], [0, 0, -1], [0, -1, 0], [0, 1, 0], [1, 0, 0], [-1, 0, 0]];
const cross = ([a, b, c], [x, y, z]) => [b * z - c * y, c * x - a * z, a * y - b * x];
const key = v => v.join(',');
const axisOf = (s, value) => AXES[s.indexOf(value)];
// Right-handed chirality w.r.t. START: value vectors from START; top × front must give right.
const rightHanded = s => key(cross(axisOf(START, s[0]), axisOf(START, s[2]))) === key(axisOf(START, s[4]));
const opp7 = s => [0, 2, 4].every(i => s[i] + s[i + 1] === 7);
assert.ok(rightHanded(START) && opp7(START));
assert.deepStrictEqual([...DIRS].sort(), ['away', 'left', 'right', 'toward']);
for (const d of DIRS) assert.deepStrictEqual([d, d, d, d].reduce(tip, START), START, `4 × ${d}`);
// Rotation of every vector by a tip (top goes to the named side).
const ROT = { right: ([x, y, z]) => [z, y, -x], left: ([x, y, z]) => [-z, y, x], toward: ([x, y, z]) => [x, -z, y], away: ([x, y, z]) => [x, z, -y] };
const topAfter = ([top, front, right], moves) => {
    // Rebuild the die from its visible faces, roll every face vector, read the face pointing up.
    const faces = [[top, AXES[0]], [7 - top, AXES[1]], [front, AXES[2]], [7 - front, AXES[3]], [right, AXES[4]], [7 - right, AXES[5]]];
    const rolled = faces.map(([v, a]) => [v, moves.reduce((w, m) => ROT[m](w), a)]);
    return rolled.find(([, a]) => key(a) === '0,0,1')[0];
};
for (let i = 0; i < 500; i++) {
    let s = START;
    const moves = Array.from({ length: 1 + (i % 7) }, () => DIRS[Math.floor(Math.random() * 4)]);
    for (const m of moves) {
        const n = tip(s, m);
        assert.ok(opp7(n) && rightHanded(n), `tip ${m} breaks the die`);
        assert.strictEqual(n[0], topAfter([s[0], s[2], s[4]], [m]));
        s = n;
    }
    assert.strictEqual(s[0], topAfter([START[0], START[2], START[4]], moves));
}
assert.ok(Object.values(TIPS).every(p => [...p].sort().join() === '0,1,2,3,4,5'));

// Views: a labelling puts letter i on axis lab[i]; it fits a view (top, front, right) iff those three axes
// can be turned to up/front/right, i.e. they are orthogonal and right-handed (top × front = right).
const LABELLINGS = (function perms(a) { return a.length < 2 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])); })([0, 1, 2, 3, 4, 5]);
const fits = (lab, [t, f, r]) => key(cross(AXES[lab[t]], AXES[lab[f]])) === key(AXES[lab[r]]);
const oppositeLetters = (views, x) => new Set(LABELLINGS.filter(lab => views.every(v => fits(lab, v))).map(lab => lab.indexOf(lab[x] ^ 1)));

function check(p) {
    const d = p.data;
    switch (p.variant) {
        case 'net': {
            const { cells, opp, values, shown, star } = p.net;
            assert.deepStrictEqual(fold(cells), opp); // still folds after rotation/reflection
            values.forEach((v, i) => assert.strictEqual(v + values[opp[i]], 7));
            assert.deepStrictEqual([...values].sort(), [1, 2, 3, 4, 5, 6]);
            assert.strictEqual(shown.length, 3);
            shown.forEach(i => assert.ok(!shown.includes(opp[i]), 'shown faces are not opposite'));
            assert.ok(!shown.includes(star));
            assert.strictEqual(p.answer, 7 - values[opp[star]]);
            break;
        }
        case 'tower_hidden':
        case 'tower_visible': {
            const { k, top } = d;
            assert.ok(k >= 2 && k <= 8 && top >= 1 && top <= 6);
            // Tops of the lower dice are arbitrary; the top die's top is given.
            const tops = Array.from({ length: k }, (_, i) => (i === k - 1 ? top : 1 + (i * 5) % 6));
            const hidden = sum(tops.map(t => t + (7 - t))) - top;
            assert.strictEqual(p.answer, p.variant === 'tower_hidden' ? hidden : 21 * k - hidden);
            assert.deepStrictEqual(p.tower, { k, top });
            break;
        }
        case 'glued_equal':
            assert.ok(d.k >= 2 && d.k <= 4 && d.contacts.length === d.k - 1);
            assert.strictEqual(p.answer, chainVisible(d.k, d.contacts.map(c => ({ ...c, x: c.g, y: c.g }))));
            break;
        case 'glued_free':
            assert.ok(d.k >= 2 && d.k <= 4 && d.contacts.length === d.k - 1);
            assert.strictEqual(p.answer, chainVisible(d.k, d.contacts));
            break;
        case 'glued_inverse': {
            const [a, b] = p.pair;
            assert.ok(a !== b && a >= 1 && b <= 6 && b >= 1 && a <= 6);
            assert.strictEqual(chainVisible(3, [{ a: 1, b: 2, x: a, y: a }, { a: 2, b: 3, x: b, y: b }]), d.visible);
            assert.deepStrictEqual(pairs((63 - d.visible) / 2), [[Math.min(a, b), Math.max(a, b)]]);
            assert.strictEqual(p.answer, a + b);
            break;
        }
        case 'table_row': {
            const { k, contacts, tops } = d;
            assert.ok(k >= 2 && k <= 7 && contacts.length === k - 1 && tops.length === k);
            // Each die: top, bottom = 7 − top, left, right, front, back. Glued faces are side faces,
            // a middle die's left and right are opposite.
            let visible = 0;
            for (let i = 0; i < k; i++) {
                const left = i > 0 ? contacts[i - 1].g : null, right = i < k - 1 ? contacts[i].g : null;
                const side = left ?? 7 - right;
                if (left !== null && right !== null) assert.strictEqual(left + right, 7);
                assert.ok(side !== tops[i] && side !== 7 - tops[i], 'glued faces are side faces');
                const front = [1, 2, 3, 4, 5, 6].find(v => ![tops[i], 7 - tops[i], side, 7 - side].includes(v));
                const faces = { top: tops[i], bottom: 7 - tops[i], left: side, right: 7 - side, front, back: 7 - front };
                visible += faces.top + faces.front + faces.back + (left === null ? faces.left : 0) + (right === null ? faces.right : 0);
            }
            assert.strictEqual(p.answer, visible);
            break;
        }
        case 'tip_moves':
            assert.ok(p.data.moves.length >= 1 && p.data.moves.length <= 3);
            assert.ok(rightHanded([p.cube[0], 7 - p.cube[0], p.cube[1], 7 - p.cube[1], p.cube[2], 7 - p.cube[2]]), 'start die is a real die');
            assert.strictEqual(p.answer, topAfter(p.cube, p.data.moves));
            break;
        case 'tip_path':
            assert.ok(p.strip >= 2 && p.strip <= 4);
            assert.ok(rightHanded([p.cube[0], 7 - p.cube[0], p.cube[1], 7 - p.cube[1], p.cube[2], 7 - p.cube[2]]), 'start die is a real die');
            assert.strictEqual(p.answer, topAfter(p.cube, Array(p.strip - 1).fill('right')));
            break;
        case 'views_opposite':
        case 'views_bottom': {
            assert.strictEqual(p.views.length, 3);
            assert.strictEqual(new Set(p.views.map(key)).size, 3, 'three different views');
            const x = p.variant === 'views_opposite' ? p.data.x : p.views[p.data.v - 1][0];
            const opp = oppositeLetters(p.views, x);
            assert.strictEqual(opp.size, 1, 'answer is uniquely determined');
            assert.strictEqual(p.answer, [...opp][0] + 1);
            assert.ok(p.answer >= 1 && p.answer <= 6);
            break;
        }
        default: assert.fail(`unknown variant ${p.variant}`);
    }
    assert.strictEqual(p.controlSum, digitalRoot(p.answer));
    assert.ok(p.controlSum >= 0 && p.controlSum <= 9);
}

for (const lang of ['en', 'de', 'ru']) {
    for (let round = 0; round < 30; round++) {
        const { problems, controlSums } = gen(TYPES, lang);
        assert.strictEqual(problems.length, 30);
        problems.forEach((p, i) => {
            check(p);
            assert.strictEqual(controlSums[i].controlSum, p.controlSum);
            assert.ok(p.text && !/[{}]|undefined/.test(p.text), `unfilled template: ${p.text}`);
        });
    }
}

// Every type alone yields only its own problems; every variant is reachable.
const seen = new Set();
for (const type of TYPES) {
    for (let i = 0; i < 10; i++) gen([type]).problems.forEach(p => { assert.strictEqual(p.type, type); seen.add(p.variant); });
}
for (const v of ['net', 'tower_hidden', 'tower_visible', 'glued_equal', 'glued_free', 'glued_inverse', 'table_row', 'tip_moves', 'tip_path', 'views_opposite', 'views_bottom']) assert.ok(seen.has(v), `variant ${v} never generated`);

// Russian plural forms.
const ru = gen(['tower'], 'ru', 30).problems.map(p => p.text).join(' ');
assert.ok(!/\b[2-4] игральных кубиков|\b[5-8] игральных кубика\b/.test(ru), ru);

assert.strictEqual(gen(TYPES, 'en', 5).problems.length, 5);
assert.throws(() => gen([]));
assert.throws(() => gen(TYPES, 'en', 0));

console.log('test-dice: all tests passed');
