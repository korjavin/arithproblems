import assert from 'assert';
import fs from 'fs';
import { generateMagicSquaresData, isMagic, square3, square4, SIZES, HIDDEN, SUM_MODES } from './generators/magic-squares.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.magic_squares]));
const gen = (opts = {}) => generateMagicSquaresData({ size: '3', hidden: 'few', magicSumMode: 'show', numberOfProblems: 12, translations: LOCALES.en, ...opts });

// Independent line list.
const linesOf = n => {
    const idx = [...Array(n).keys()];
    return [...idx.map(r => idx.map(c => [r, c])), ...idx.map(c => idx.map(r => [r, c])), idx.map(i => [i, i]), idx.map(i => [i, n - 1 - i])];
};
const lineSum = (g, l) => l.reduce((s, [r, c]) => s + g[r][c], 0);
const shownMatch = (p, g) => p.grid.every((row, r) => row.every((v, c) => p.hidden[r][c] || v === null || g[r][c] === v));
const hiddenList = p => p.hidden.flatMap((row, r) => row.map((h, c) => (h ? [r, c] : null))).filter(Boolean);

function permutations(arr) {
    if (arr.length <= 1) return [arr];
    return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(rest => [x, ...rest]));
}

// 3×3: brute force over every (c, a, b) square of distinct positive numbers. The magic sum is
// known (given, or from the complete line), so c = sum / 3.
function count3(p) {
    const full = linesOf(3).find(l => l.every(([r, c]) => !p.hidden[r][c]));
    const S = p.showSum ? p.magicSum : lineSum(p.grid, full);
    const c = S / 3;
    let n = 0;
    for (let a = -c; a <= c; a++) for (let b = -c; b <= c; b++) {
        const g = square3(c, a, b);
        const v = g.flat();
        if (v.every(x => x > 0) && new Set(v).size === 9 && shownMatch(p, g)) n++;
    }
    return n;
}

// 4×4: every permutation of the listed numbers over the hidden cells.
function count4(p) {
    const cells = hiddenList(p);
    const S = p.magicSum;
    return permutations(p.hiddenNumbers).filter(perm => {
        const g = p.grid.map(row => [...row]);
        cells.forEach(([r, c], i) => { g[r][c] = perm[i]; });
        return linesOf(4).every(l => lineSum(g, l) === S);
    }).length;
}

// Rechenviereck: every choice of the hidden corners (each corner is at most a neighbouring sum ≤ 60).
function count2(p) {
    const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
    const free = corners.filter(([r, c]) => p.hidden[r][c]);
    let n = 0;
    const vals = Array(free.length).fill(0);
    (function rec(i) {
        if (i === free.length) {
            const g = p.grid.map(row => [...row]);
            free.forEach(([r, c], j) => { g[r][c] = vals[j]; });
            const [a, b, c, d] = corners.map(([r, cc]) => g[r][cc]);
            const sums = { '0,1': a + b, '1,0': a + c, '1,2': b + d, '2,1': c + d };
            if (Object.entries(sums).every(([k, s]) => { const [r, cc] = k.split(',').map(Number); return p.hidden[r][cc] || p.grid[r][cc] === s; })) n++;
            return;
        }
        for (let v = 0; v <= 60; v++) { vals[i] = v; rec(i + 1); }
    })(0);
    return n;
}

// Parametrisation and the 4×4 construction.
for (let i = 0; i < 200; i++) {
    const g4 = square4(i % 21);
    assert.ok(isMagic(g4), '4×4 is magic');
    assert.strictEqual(new Set(g4.flat()).size, 16);
    assert.strictEqual(lineSum(g4, linesOf(4)[0]), 34 + 4 * (i % 21));
}
assert.ok(isMagic(square3(5, 1, 3)));
assert.deepStrictEqual(square3(5, 1, 3).flat().sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8, 9]);

const seen = new Set();
for (const lang of ['en', 'de', 'ru']) {
    for (const size of SIZES) {
        for (const hidden of HIDDEN) {
            for (const magicSumMode of SUM_MODES) {
                const { problems, controlSums } = gen({ size, hidden, magicSumMode, translations: LOCALES[lang], numberOfProblems: lang === 'en' ? 12 : 3 });
                assert.strictEqual(controlSums.length, problems.length);
                problems.forEach((p, i) => {
                    seen.add(`${p.kind}/${hidden}/${p.showSum}`);
                    const n = p.grid.length;
                    assert.ok(p.text && !/[{}]|undefined/.test(p.text), `filled text: ${p.text}`);
                    const k = hiddenList(p).length;
                    assert.ok(p.hidden[p.star[0]][p.star[1]], '★ is hidden');
                    assert.strictEqual(controlSums[i].controlSum, digitalRoot(p.grid[p.star[0]][p.star[1]]));
                    assert.ok(controlSums[i].controlSum >= 0 && controlSums[i].controlSum <= 9);
                    if (p.kind === '2') {
                        assert.strictEqual(n, 3);
                        const [a, b, c, d] = [p.grid[0][0], p.grid[0][2], p.grid[2][0], p.grid[2][2]];
                        assert.deepStrictEqual([p.grid[0][1], p.grid[1][0], p.grid[1][2], p.grid[2][1], p.grid[1][1]], [a + b, a + c, b + d, c + d, null]);
                        assert.strictEqual(k, hidden === 'few' ? 3 : 4);
                        assert.strictEqual(count2(p), 1, 'Rechenviereck unique');
                        return;
                    }
                    assert.strictEqual(n, Number(p.kind));
                    assert.ok(isMagic(p.grid), 'magic');
                    assert.strictEqual(lineSum(p.grid, linesOf(n)[0]), p.magicSum);
                    const v = p.grid.flat();
                    assert.ok(v.every(x => Number.isInteger(x) && x > 0) && new Set(v).size === n * n, 'distinct positive');
                    const [lo, hi] = n === 3 ? (hidden === 'few' ? [3, 4] : [5, 6]) : (hidden === 'few' ? [4, 5] : [6, 8]);
                    assert.ok(k >= lo && k <= hi, `hidden count ${k}`);
                    assert.strictEqual(p.showSum, magicSumMode === 'show');
                    assert.strictEqual(p.text.includes(String(p.magicSum)), p.showSum || (p.kind === '4' && p.hiddenNumbers.includes(p.magicSum)));
                    if (!p.showSum) assert.ok(linesOf(n).some(l => l.every(([r, c]) => !p.hidden[r][c])), 'complete line when the sum is hidden');
                    if (n === 3) {
                        assert.ok(p.grid[1][1] >= 5 && p.grid[1][1] <= 40);
                        assert.strictEqual(count3(p), 1, '3×3 unique');
                    } else {
                        assert.deepStrictEqual(p.hiddenNumbers, hiddenList(p).map(([r, c]) => p.grid[r][c]).sort((x, y) => x - y));
                        assert.ok(p.text.includes(p.hiddenNumbers.join(', ')));
                        assert.strictEqual(count4(p), 1, '4×4 unique');
                    }
                });
            }
        }
    }
}
['3', '4', '2'].forEach(kind => HIDDEN.forEach(h => assert.ok(seen.has(`${kind}/${h}/false`), `${kind}/${h}`)));
['3', '4'].forEach(kind => HIDDEN.forEach(h => assert.ok(seen.has(`${kind}/${h}/true`), `${kind}/${h}/show`)));

assert.throws(() => gen({ size: '5' }), /size/);
assert.throws(() => gen({ hidden: 'all' }), /hidden/);
assert.throws(() => gen({ magicSumMode: 'x' }), /sum/);
assert.throws(() => gen({ numberOfProblems: 0 }), /number/);

console.log('All magic-squares tests passed!');
