import { generateNumberSequencesData } from './generators/number-sequences.js';
import assert from 'assert';

function testBasicShape() {
    const { problems, controlSums } = generateNumberSequencesData({
        types: ['arithmetic'],
        numTerms: 4,
        maxValue: 100,
        numberOfProblems: 10,
    });
    assert.strictEqual(problems.length, 10);
    assert.strictEqual(controlSums.length, 10);
    problems.forEach((p, i) => {
        assert(Array.isArray(p.terms), `problem ${i} terms array`);
        assert.strictEqual(p.terms.length, 4, `problem ${i} numTerms`);
        assert(Number.isInteger(p.answer), `problem ${i} answer is integer`);
        assert.strictEqual(p.type, 'arithmetic', `problem ${i} type`);
    });
    controlSums.forEach((cs, i) => {
        assert.strictEqual(typeof cs.controlSum, 'number');
        assert(cs.controlSum >= 0 && cs.controlSum <= 9, `problem ${i} control sum 0-9`);
    });
}

function testArithmeticCorrectness() {
    const { problems } = generateNumberSequencesData({
        types: ['arithmetic'],
        numTerms: 5,
        maxValue: 200,
        numberOfProblems: 30,
    });
    problems.forEach((p, i) => {
        const d = p.terms[1] - p.terms[0];
        for (let j = 2; j < p.terms.length; j++) {
            assert.strictEqual(p.terms[j] - p.terms[j - 1], d, `problem ${i} AP: term ${j}`);
        }
        assert.strictEqual(p.answer, p.terms[p.terms.length - 1] + d, `problem ${i} AP: answer matches`);
    });
}

function testGeometricCorrectness() {
    const { problems } = generateNumberSequencesData({
        types: ['geometric'],
        numTerms: 4,
        maxValue: 500,
        numberOfProblems: 30,
    });
    problems.forEach((p, i) => {
        assert(p.terms[0] !== 0, `problem ${i} GP: first term non-zero`);
        const r = p.terms[1] / p.terms[0];
        for (let j = 2; j < p.terms.length; j++) {
            assert.strictEqual(p.terms[j], p.terms[j - 1] * r, `problem ${i} GP: term ${j}`);
        }
        assert.strictEqual(p.answer, p.terms[p.terms.length - 1] * r, `problem ${i} GP: answer matches`);
    });
}

function testSquaresCorrectness() {
    const { problems } = generateNumberSequencesData({
        types: ['squares'],
        numTerms: 4,
        maxValue: 200,
        numberOfProblems: 20,
    });
    problems.forEach((p, i) => {
        const start = Math.round(Math.sqrt(p.terms[0]));
        for (let j = 0; j < p.terms.length; j++) {
            assert.strictEqual(p.terms[j], (start + j) ** 2, `problem ${i} squares: term ${j}`);
        }
        assert.strictEqual(p.answer, (start + p.terms.length) ** 2, `problem ${i} squares: answer matches`);
    });
}

function testFibonacciCorrectness() {
    const { problems } = generateNumberSequencesData({
        types: ['fibonacci'],
        numTerms: 5,
        maxValue: 500,
        numberOfProblems: 20,
    });
    problems.forEach((p, i) => {
        for (let j = 2; j < p.terms.length; j++) {
            assert.strictEqual(p.terms[j], p.terms[j - 1] + p.terms[j - 2], `problem ${i} fib: term ${j}`);
        }
        const expected = p.terms[p.terms.length - 1] + p.terms[p.terms.length - 2];
        assert.strictEqual(p.answer, expected, `problem ${i} fib: answer matches`);
    });
}

function testAlternatingCorrectness() {
    const { problems } = generateNumberSequencesData({
        types: ['alternating'],
        numTerms: 5,
        maxValue: 500,
        numberOfProblems: 40,
    });
    problems.forEach((p, i) => {
        assert(p.meta && Array.isArray(p.meta.ops) && p.meta.ops.length === 2, `problem ${i} alt: meta.ops`);
        const kinds = p.meta.ops.map(o => o.kind).sort().join(',');
        assert.strictEqual(kinds, 'add,mul', `problem ${i} alt: one mul + one add`);
        const apply = (v, op) => op.kind === 'mul' ? v * op.val : v + op.val;
        const all = p.terms.concat([p.answer]);
        for (let j = 0; j < all.length - 1; j++) {
            const expected = apply(all[j], p.meta.ops[j % 2]);
            assert.strictEqual(all[j + 1], expected, `problem ${i} alt: step ${j} (${all[j]} -> ${all[j+1]}, expected ${expected})`);
        }
    });
}

function testMaxValueRespected() {
    const { problems } = generateNumberSequencesData({
        types: ['arithmetic', 'geometric', 'squares', 'fibonacci', 'alternating'],
        numTerms: 4,
        maxValue: 100,
        numberOfProblems: 50,
    });
    problems.forEach((p, i) => {
        p.terms.concat([p.answer]).forEach((t, j) => {
            assert(Math.abs(t) <= 100, `problem ${i} term ${j} (${t}) within maxValue`);
        });
    });
}

function testAllowNegativeFalseKeepsTermsNonNegative() {
    const { problems } = generateNumberSequencesData({
        types: ['arithmetic', 'geometric', 'squares', 'fibonacci', 'alternating'],
        numTerms: 4,
        maxValue: 200,
        allowNegative: false,
        numberOfProblems: 80,
    });
    problems.forEach((p, i) => {
        p.terms.concat([p.answer]).forEach((t, j) => {
            assert(t >= 0, `problem ${i} (${p.type}) term ${j} (${t}) should be non-negative when allowNegative=false`);
        });
    });
}

function testAllowNegativeTrueProducesSomeNegatives() {
    const { problems } = generateNumberSequencesData({
        types: ['arithmetic'],
        numTerms: 4,
        maxValue: 100,
        allowNegative: true,
        numberOfProblems: 80,
    });
    const someNegative = problems.some(p => p.terms.concat([p.answer]).some(t => t < 0));
    assert(someNegative, 'expected at least one negative value across 80 AP problems with allowNegative=true');
}

function testInvalidInputs() {
    assert.throws(() => generateNumberSequencesData({ types: [], numTerms: 4, maxValue: 100, numberOfProblems: 5 }));
    assert.throws(() => generateNumberSequencesData({ types: ['unknown'], numTerms: 4, maxValue: 100, numberOfProblems: 5 }));
    assert.throws(() => generateNumberSequencesData({ types: ['arithmetic'], numTerms: 2, maxValue: 100, numberOfProblems: 5 }));
    assert.throws(() => generateNumberSequencesData({ types: ['arithmetic'], numTerms: 4, maxValue: 5, numberOfProblems: 5 }));
    assert.throws(() => generateNumberSequencesData({ types: ['arithmetic'], numTerms: 4, maxValue: 100, numberOfProblems: 0 }));
}

testBasicShape();
testArithmeticCorrectness();
testGeometricCorrectness();
testSquaresCorrectness();
testFibonacciCorrectness();
testAlternatingCorrectness();
testMaxValueRespected();
testAllowNegativeFalseKeepsTermsNonNegative();
testAllowNegativeTrueProducesSomeNegatives();
testInvalidInputs();
console.log('All number-sequences tests passed.');
