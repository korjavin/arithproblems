import assert from 'assert';
import fs from 'fs';
import { generateFindTheNumberData, TYPES } from './generators/find-the-number.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.find_the_number]));

const gen = (types, opts = {}, lang = 'en') => generateFindTheNumberData({
    types, chainLength: 3, maxValue: 1000, allowHalving: true, numberOfProblems: 30, translations: LOCALES[lang], ...opts,
});

const within = (n, max) => Number.isInteger(n) && n >= 0 && n <= max;

// Independent evaluators: recompute every answer from the stated data.
function evalTerm(term, max, allowHalving) {
    const { kind, a, b } = term;
    assert(within(a, max) && within(b, max), `operands within range: ${a}, ${b}`);
    if (kind === 'multiple') { assert(a >= 2 && a <= 10); return a * b; }
    if (kind === 'part') { assert(allowHalving && a >= 2 && a <= 10 && b % a === 0, 'exact k-th part'); return b / a; }
    if (kind === 'sum') return a + b;
    if (kind === 'difference') { assert(a > b); return a - b; }
    if (kind === 'product') return a * b;
    if (kind === 'quotient') { assert(allowHalving && b >= 2 && a % b === 0, 'exact quotient'); return a / b; }
    assert.fail(`unknown term ${kind}`);
}

function checkProblem(p, { chainLength, maxValue: max, allowHalving }) {
    const d = p.data;
    assert(Number.isInteger(p.answer) && p.answer > 0 && p.answer <= max, `answer in 1..max: ${p.answer}`);
    switch (p.variant) {
        case 'describe_simple':
            assert.strictEqual(chainLength, 1);
            assert.strictEqual(evalTerm(d.terms[0], max, allowHalving), p.answer);
            break;
        case 'describe_compound': {
            assert(chainLength >= 2);
            const [x, y] = d.terms.map(term => evalTerm(term, max, allowHalving));
            assert(within(x, max) && within(y, max));
            const value = { add: x + y, sub: x - y, mul: x * y, div: x / y }[d.outer];
            if (d.outer === 'div') assert(allowHalving && y >= 2 && x % y === 0, 'exact division');
            assert.strictEqual(value, p.answer);
            break;
        }
        case 'inverse': {
            assert.strictEqual(d.steps.length, chainLength, 'chainLength respected');
            let cur = p.answer;
            d.steps.forEach((s, i) => assert(i === 0 || [s.op, d.steps[i - 1].op].sort().join() !== 'div,mul', 'no × right after ÷ or vice versa'));
            for (const s of d.steps) {
                let n = s.k;
                if (s.term === 'kfold') n = s.k * s.m;
                if (s.term === 'part') { assert(allowHalving && s.m % s.k === 0 && s.m <= max, 'exact part'); n = s.m / s.k; }
                if (s.op === 'mul') assert(s.k >= 2 && s.k <= 9);
                if (s.op === 'div') assert(allowHalving && s.k >= 2 && s.k <= 9 && cur % s.k === 0, 'exact division');
                cur = { add: cur + n, sub: cur - n, mul: cur * n, div: cur / n }[s.op];
                assert(within(cur, max), `intermediate within 0..max: ${cur}`);
            }
            assert.strictEqual(cur, d.result, 'forward chain reproduces the stated result');
            break;
        }
        case 'halving': {
            assert(d.plus.length >= 2 && d.plus.length <= 5);
            assert.strictEqual(d.plus.length, Math.min(5, chainLength + 1));
            let have = p.answer;
            for (const plus of d.plus) {
                assert(have % 2 === 0, 'half is a whole number');
                const given = have / 2 + (plus ? 1 : 0);
                have -= given;
                assert(have >= 1);
            }
            assert.strictEqual(have, d.kept);
            break;
        }
        case 'letters': {
            assert.strictEqual(d.lines.length, 3);
            // Solve the printed equations: eq1 for a, eq2 for b, eq3 for c.
            const solve = (line, known, unknown) => {
                for (let v = 0; v <= max; v++) {
                    const expr = line.replace(/−/g, '-').replace(/·/g, '*').replace(new RegExp(`\\b${unknown}\\b`, 'g'), v)
                        .replace(/\b[ab]\b/g, l => known[l]);
                    const [lhs, rhs] = expr.split('=');
                    if (eval(lhs) === eval(rhs)) return v;
                }
                assert.fail(`no solution for ${line}`);
            };
            const a = solve(d.lines[0], {}, 'a');
            const b = solve(d.lines[1], { a }, 'b');
            const c = solve(d.lines[2], { a, b }, 'c');
            assert.deepStrictEqual([a, b, c], [d.a, d.b, p.answer]);
            assert(within(b, max));
            break;
        }
        default: assert.fail(`unknown variant ${p.variant}`);
    }
}

function testAll() {
    const seen = new Set();
    for (const lang of Object.keys(LOCALES)) {
        for (const type of TYPES) {
            for (const chainLength of [1, 2, 3, 4]) {
                for (const maxValue of [100, 1000, 10000]) {
                    for (const allowHalving of [true, false]) {
                        const opts = { chainLength, maxValue, allowHalving };
                        const { problems, controlSums } = gen([type], opts, lang);
                        assert.strictEqual(problems.length, 30);
                        problems.forEach((p, i) => {
                            assert.strictEqual(p.type, type);
                            seen.add(p.variant);
                            checkProblem(p, opts);
                            assert(!/[{}]|undefined|NaN/.test(p.text), `${lang} ${p.variant}: unfilled template: ${p.text}`);
                            assert.strictEqual(controlSums[i].controlSum, digitalRoot(p.answer));
                            assert(controlSums[i].controlSum >= 0 && controlSums[i].controlSum <= 9);
                        });
                    }
                }
            }
        }
    }
    ['describe_simple', 'describe_compound', 'inverse', 'halving', 'letters'].forEach(v => assert(seen.has(v), `variant generated: ${v}`));
    console.log('All sub-type tests passed!');
}

function testMixAndErrors() {
    const { problems } = gen(TYPES, {}, 'de');
    assert.strictEqual(new Set(problems.map(p => p.type)).size, 4, 'every selected type appears');
    const firstLetters = problems.findIndex(p => p.type === 'letters');
    assert(problems.slice(firstLetters).every(p => p.type === 'letters'), 'letter chains come last');
    assert.strictEqual(gen(['inverse'], { numberOfProblems: 100 }).problems.length, 30);
    assert.throws(() => gen([]));
    assert.throws(() => gen(['nope']));
    assert.throws(() => gen(['inverse'], { chainLength: 5 }));
    const inverse = gen(['inverse'], {}, 'de').problems[0].text;
    assert(inverse.startsWith('Ich denke mir eine Zahl'), inverse);
    for (const lang of ['de', 'ru']) {
        assert.deepStrictEqual(Object.keys(LOCALES[lang]).sort(), Object.keys(LOCALES.en).sort(), `${lang} has every key`);
        assert.strictEqual(LOCALES[lang].multiples.length, 10);
        assert.strictEqual(LOCALES[lang].parts.length, 10);
    }
    console.log('Mix/error tests passed!');
}

testAll();
testMixAndErrors();
console.log('All find-the-number tests passed!');
