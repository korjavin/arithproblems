import { generateCompareFractionsData, compareFractionsControlSum } from './generators/compare-fractions.js';
import assert from 'assert';

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function digitalRoot(n) {
    const num = Math.abs(n);
    if (num === 0) return 0;
    const r = num % 9;
    return r === 0 ? 9 : r;
}

const ALL = { includeSameDenominator: true, includeSameNumerator: true, includeDifferent: true };

function checkProblems({ problems, controlSums }, { maxDenominator, allowImproper }) {
    assert.strictEqual(problems.length, controlSums.length, 'one control sum per problem');
    problems.forEach((p, i) => {
        for (const f of [p.left, p.right]) {
            assert(Number.isInteger(f.n) && f.n >= 1, `problem ${i} numerator ${f.n} positive integer`);
            assert(Number.isInteger(f.d) && f.d >= 2 && f.d <= maxDenominator, `problem ${i} denominator ${f.d} in range`);
            if (!allowImproper) assert(f.n < f.d, `problem ${i} ${f.n}/${f.d} proper`);
            else assert(f.n <= maxDenominator, `problem ${i} numerator ${f.n} <= max`);
        }
        assert(!(p.left.n === p.right.n && p.left.d === p.right.d), `problem ${i} sides differ as written`);
        const l = p.left.n * p.right.d, r = p.right.n * p.left.d;
        const expected = l < r ? '<' : l > r ? '>' : '=';
        assert.strictEqual(p.comparison, expected, `problem ${i} comparison`);
        if (p.mode === 'same-denominator') assert.strictEqual(p.left.d, p.right.d, `problem ${i} same denominator`);
        if (p.mode === 'same-numerator') assert.strictEqual(p.left.n, p.right.n, `problem ${i} same numerator`);
        if (p.mode === 'different') assert.notStrictEqual(p.left.d, p.right.d, `problem ${i} different denominators`);

        const larger = p.comparison === '<' ? p.right : p.left;
        const g = gcd(larger.n, larger.d);
        const cs = controlSums[i].controlSum;
        assert.strictEqual(cs, digitalRoot(larger.n / g + larger.d / g), `problem ${i} control sum`);
        assert(cs >= 1 && cs <= 9, `problem ${i} control sum 1-9`);
    });
}

function testBasic() {
    for (const maxDenominator of [4, 10, 30]) {
        for (const allowImproper of [false, true]) {
            const res = generateCompareFractionsData({ maxDenominator, allowImproper, ...ALL, numberOfProblems: 60 });
            assert.strictEqual(res.problems.length, 60);
            checkProblems(res, { maxDenominator, allowImproper });
        }
    }
}

function testModesHonored() {
    for (const mode of ['same-denominator', 'same-numerator', 'different']) {
        const res = generateCompareFractionsData({
            maxDenominator: 12,
            includeSameDenominator: mode === 'same-denominator',
            includeSameNumerator: mode === 'same-numerator',
            includeDifferent: mode === 'different',
            numberOfProblems: 40,
        });
        checkProblems(res, { maxDenominator: 12, allowImproper: false });
        res.problems.forEach((p, i) => assert.strictEqual(p.mode, mode, `problem ${i} mode ${mode}`));
    }
}

function testAnswerMix() {
    const { problems } = generateCompareFractionsData({ maxDenominator: 12, ...ALL, numberOfProblems: 150 });
    const counts = { '<': 0, '>': 0, '=': 0 };
    problems.forEach(p => { counts[p.comparison]++; });
    assert(counts['<'] > 0 && counts['>'] > 0, 'both < and > present');
    assert(counts['='] >= 3, `expected some equalities, got ${counts['=']}`);
}

function testEqualControlSumUnambiguous() {
    // 2/3 = 6/9: both reduce to 2/3 → DR(5)
    assert.strictEqual(compareFractionsControlSum({ n: 2, d: 3 }, { n: 6, d: 9 }, '='), 5);
    assert.strictEqual(compareFractionsControlSum({ n: 6, d: 9 }, { n: 2, d: 3 }, '='), 5);
    // 3/8 < 5/8 → 5/8 → DR(13) = 4
    assert.strictEqual(compareFractionsControlSum({ n: 3, d: 8 }, { n: 5, d: 8 }, '<'), 4);
}

function testInvalidInputs() {
    assert.throws(() => generateCompareFractionsData({ maxDenominator: 3, ...ALL, numberOfProblems: 5 }));
    assert.throws(() => generateCompareFractionsData({ maxDenominator: 31, ...ALL, numberOfProblems: 5 }));
    assert.throws(() => generateCompareFractionsData({ maxDenominator: 10, ...ALL, numberOfProblems: 0 }));
    assert.throws(() => generateCompareFractionsData({
        maxDenominator: 10, includeSameDenominator: false, includeSameNumerator: false, includeDifferent: false, numberOfProblems: 5,
    }));
}

testBasic();
testModesHonored();
testAnswerMix();
testEqualControlSumUnambiguous();
testInvalidInputs();
console.log('All compare-fractions tests passed.');
