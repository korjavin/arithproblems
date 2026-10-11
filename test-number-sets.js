import { generateNumberSetsData, NUMBER_SETS } from './generators/number-sets.js';
import assert from 'assert';

const base = { maxValue: 20, allowNegative: true, allowIrrational: true, allowTricky: true, numberOfProblems: 300 };

// Independent classification from the printed text.
function classify(display) {
    const text = display.replace('−', '-');
    let m;
    if ((m = text.match(/^(-?)(\d+)$/))) {
        const v = Number(text);
        return { integer: true, rational: true, natural: v > 0 };
    }
    if ((m = text.match(/^(-?)(\d+)\/(\d+)$/))) {
        const integer = Number(m[2]) % Number(m[3]) === 0;
        return { integer, rational: true, natural: integer && Number(m[2]) > 0 && !m[1] };
    }
    if ((m = text.match(/^-?√(\d+)$/))) {
        const r = Math.round(Math.sqrt(Number(m[1])));
        const perfect = r * r === Number(m[1]);
        return { integer: perfect, rational: perfect, natural: perfect && !text.startsWith('-') };
    }
    if (/^-?\d+\.\d+$/.test(text) || (text.endsWith('…') && /^-?\d+\.(\d+?)\1+$/.test(text.slice(0, -1)))) {
        return { integer: false, rational: true, natural: false };
    }
    // π-expressions, √n + k, and non-repeating pattern decimals
    return { integer: false, rational: false, natural: false };
}

function testStructure() {
    const { problems, controlSums } = generateNumberSetsData(base);
    assert.strictEqual(problems.length, 300);
    assert.strictEqual(controlSums.length, 300);
    problems.forEach((p, i) => {
        assert.deepStrictEqual(Object.keys(p.membership), NUMBER_SETS);
        assert.strictEqual(p.membership.real, true, 'everything here is real');
        assert.notStrictEqual(p.membership.rational, p.membership.irrational, `rational xor irrational: ${p.display}`);
        // nesting: N ⊂ W ⊂ Z ⊂ Q
        if (p.membership.natural) assert(p.membership.whole);
        if (p.membership.whole) assert(p.membership.integers);
        if (p.membership.integers) assert(p.membership.rational);
        const count = NUMBER_SETS.filter(s => p.membership[s]).length;
        assert.strictEqual(controlSums[i].controlSum, count);
        assert(count >= 1 && count <= 9);
    });
}

function testMembershipMatchesText() {
    const { problems } = generateNumberSetsData(base);
    problems.forEach(p => {
        const c = classify(p.display);
        assert.strictEqual(p.membership.integers, c.integer, `integers: ${p.display}`);
        assert.strictEqual(p.membership.rational, c.rational, `rational: ${p.display}`);
        assert.strictEqual(p.membership.natural, c.natural, `natural: ${p.display}`);
    });
}

function testKnownExamples() {
    // 3 is natural, whole, integer, rational, real - but not irrational.
    const { problems } = generateNumberSetsData({ ...base, allowNegative: false, allowIrrational: false, allowTricky: false, numberOfProblems: 200 });
    const three = problems.find(p => p.display === '3');
    if (three) {
        assert.deepStrictEqual(three.membership, { natural: true, whole: true, integers: true, rational: true, irrational: false, real: true });
    }
    const zero = problems.find(p => p.display === '0');
    if (zero) assert.strictEqual(zero.membership.natural, false, '0 is whole but not natural');
}

function testToggles() {
    const plain = generateNumberSetsData({ ...base, allowNegative: false, allowIrrational: false, allowTricky: false });
    plain.problems.forEach(p => {
        assert(!p.display.includes('−'), `no negatives: ${p.display}`);
        assert(!p.membership.irrational, `no irrationals: ${p.display}`);
        assert(!p.display.includes('√'), `no roots without tricky/irrational: ${p.display}`);
    });
    const withIrr = generateNumberSetsData(base);
    assert(withIrr.problems.some(p => p.membership.irrational), 'irrationals appear when allowed');
    assert(withIrr.problems.some(p => p.membership.integers && !p.membership.natural && !p.membership.whole), 'negative integers appear');
}

function testValidation() {
    assert.throws(() => generateNumberSetsData({ ...base, maxValue: 1 }));
    assert.throws(() => generateNumberSetsData({ ...base, maxValue: 500 }));
    assert.throws(() => generateNumberSetsData({ ...base, numberOfProblems: 0 }));
}

testStructure();
testMembershipMatchesText();
testKnownExamples();
testToggles();
testValidation();
console.log('Number sets tests passed.');
