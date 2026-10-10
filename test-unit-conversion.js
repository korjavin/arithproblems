import assert from 'assert';
import { generateUnitConversionData, displayNumber, factorOf, unitControlSum } from './generators/unit-conversion.js';
import { digitalRoot } from './utils.js';

const ALL = ['length', 'mass', 'volume', 'time', 'money'];

function quantities(p) {
    const tokens = p.qty ? [{ qty: p.qty }] : [...p.lhs, ...p.rhs];
    return tokens.filter(t => t.qty).flatMap(t => t.qty);
}

function gen(over = {}) {
    return generateUnitConversionData({ families: ALL, difficulty: 2, allowDecimals: true, includeUnsolvable: false, numberOfProblems: 20, ...over });
}

function testShapeAndAnswers() {
    for (const difficulty of [1, 2, 3]) {
        for (const allowDecimals of [false, true]) {
            for (let run = 0; run < 20; run++) {
                const { problems, controlSums } = gen({ difficulty, allowDecimals });
                assert.strictEqual(problems.length, 20);
                assert.strictEqual(controlSums.length, 20);
                problems.forEach((p, i) => {
                    assert(Number.isInteger(p.answerBase) && p.answerBase > 0, `answer is a positive integer in the base unit (${p.kind})`);
                    assert(factorOf(p.blankUnit), 'blank has a known unit');
                    assert.strictEqual(controlSums[i].controlSum, unitControlSum(p.answerBase, p.blankUnit));
                    assert(controlSums[i].controlSum >= 1 && controlSums[i].controlSum <= 9, 'real answer digit 1-9');
                    const shown = [...quantities(p).map(q => displayNumber(q.base, q.u)), displayNumber(p.answerBase, p.blankUnit)];
                    shown.forEach(s => {
                        assert(s.replace(/\D/g, '').replace(/^0+/, '').length <= 4, `at most 4 digits: ${s}`);
                        const decimals = (s.split('.')[1] || '').length;
                        assert(decimals <= 2, `at most 2 decimals: ${s}`);
                        if (!allowDecimals) assert(!s.includes('.'), `decimals off -> integer: ${s}`);
                    });
                    quantities(p).forEach(q => assert(q.base > 0, 'no zero or negative quantities'));
                });
            }
        }
    }
    console.log('Shape/answer tests passed!');
}

function testEachFamily() {
    for (const family of ALL) {
        const { problems } = gen({ families: [family], numberOfProblems: 30 });
        const expected = family === 'time' ? ['time', 'calendar'] : [family];
        problems.forEach(p => {
            assert(expected.includes(p.family), `${family}: got ${p.family}`);
            assert(Number.isInteger(p.answerBase));
        });
    }
    console.log('Family tests passed!');
}

function testArithmetic() {
    // Check the answer against the displayed numbers for equation-style items.
    for (let run = 0; run < 30; run++) {
        gen({ difficulty: 3 }).problems.filter(p => p.lhs).forEach(p => {
            const side = tokens => {
                let sum = 0, sign = 1;
                tokens.forEach(t => {
                    if (t.op) sign = t.op === '+' ? 1 : -1;
                    else if (t.blank !== undefined) sum += sign * p.answerBase;
                    else sum += sign * t.qty.reduce((s, q) => s + q.base, 0);
                });
                return sum;
            };
            assert.strictEqual(side(p.lhs), side(p.rhs), `equation balances (${p.kind})`);
        });
        gen().problems.filter(p => p.kind === 'fraction').forEach(p => assert.strictEqual(p.answerBase * p.denominator, p.qty[0].base));
        gen().problems.filter(p => p.kind === 'unitPrice').forEach(p => assert.strictEqual(p.answerBase * p.count, p.qty.reduce((s, q) => s + q.base, 0)));
    }
    console.log('Arithmetic tests passed!');
}

function testUnsolvable() {
    for (let run = 0; run < 30; run++) {
        const { problems, controlSums } = gen({ includeUnsolvable: true });
        const flagged = problems.filter(p => p.unsolvable);
        assert.strictEqual(flagged.length, 1, 'exactly one unsolvable item');
        assert.strictEqual(controlSums[problems.indexOf(flagged[0])].controlSum, 0);
        const units = quantities(flagged[0]).map(q => q.u);
        assert(units.length >= 2);
    }
    assert(gen().problems.every(p => !p.unsolvable), 'none without the option');
    console.log('Unsolvable tests passed!');
}

function testLimitsAndErrors() {
    assert.strictEqual(gen({ numberOfProblems: 3 }).problems.length, 8);
    assert.strictEqual(gen({ numberOfProblems: 100 }).problems.length, 30);
    assert.throws(() => gen({ families: [] }));
    assert.throws(() => gen({ difficulty: 7 }));
    assert.strictEqual(unitControlSum(29200, 'kg'), digitalRoot(29200), 'decimal answer -> base unit');
    assert.strictEqual(unitControlSum(420, 'min'), 7, 'whole answer -> blank unit');
    assert.strictEqual(displayNumber(3960, 'eur'), '39.60');
    assert.strictEqual(displayNumber(20, 'l'), '0.02');
    console.log('Limit tests passed!');
}

testShapeAndAnswers();
testEachFamily();
testArithmetic();
testUnsolvable();
testLimitsAndErrors();
console.log('All unit-conversion tests passed!');
