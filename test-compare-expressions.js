import { generateCompareExpressionsData } from './generators/compare-expressions.js';
import { create, all } from 'mathjs';
import assert from 'assert';

const math = create(all);

function exprString({ operands, operators, bracketStart, bracketEnd }) {
    let s = '';
    for (let i = 0; i < operands.length; i++) {
        if (i === bracketStart) s += '(';
        s += operands[i];
        if (i === bracketEnd) s += ')';
        if (i < operators.length) s += ` ${operators[i]} `;
    }
    return s;
}

function testBasicShape() {
    const { problems, controlSums } = generateCompareExpressionsData({
        numOperands: 2,
        maxOperand: 10,
        allowMultiplication: true,
        allowBrackets: false,
        allowNegative: false,
        numberOfProblems: 12,
    });
    assert.strictEqual(problems.length, 12);
    assert(Array.isArray(controlSums) && controlSums.length === 0);
    problems.forEach((p, i) => {
        assert(['<', '>', '='].includes(p.comparison), `problem ${i} comparison`);
        assert(Number.isInteger(p.leftValue), `problem ${i} leftValue integer`);
        assert(Number.isInteger(p.rightValue), `problem ${i} rightValue integer`);
        assert.strictEqual(math.evaluate(exprString(p.left)), p.leftValue, `problem ${i} left match`);
        assert.strictEqual(math.evaluate(exprString(p.right)), p.rightValue, `problem ${i} right match`);
        const expected = p.leftValue < p.rightValue ? '<' : p.leftValue > p.rightValue ? '>' : '=';
        assert.strictEqual(p.comparison, expected, `problem ${i} comparison consistent`);
    });
}

function testAllowNegativeFalse() {
    const { problems } = generateCompareExpressionsData({
        numOperands: 3,
        maxOperand: 10,
        allowMultiplication: true,
        allowBrackets: false,
        allowNegative: false,
        numberOfProblems: 30,
    });
    problems.forEach((p, i) => {
        assert(p.leftValue >= 0, `problem ${i} left ${p.leftValue} non-negative`);
        assert(p.rightValue >= 0, `problem ${i} right ${p.rightValue} non-negative`);
    });
}

function testAllowMultiplicationFalse() {
    const { problems } = generateCompareExpressionsData({
        numOperands: 3,
        maxOperand: 10,
        allowMultiplication: false,
        allowBrackets: false,
        allowNegative: false,
        numberOfProblems: 30,
    });
    problems.forEach((p, i) => {
        const ops = [...p.left.operators, ...p.right.operators];
        ops.forEach(op => assert(op === '+' || op === '-', `problem ${i}: ${op} not allowed when multiplication off`));
    });
}

function testBracketsHonored() {
    const off = generateCompareExpressionsData({
        numOperands: 3, maxOperand: 9, allowMultiplication: true, allowBrackets: false, allowNegative: false, numberOfProblems: 20,
    }).problems;
    off.forEach((p, i) => {
        assert.strictEqual(p.left.bracketStart, -1, `problem ${i} left no brackets`);
        assert.strictEqual(p.right.bracketStart, -1, `problem ${i} right no brackets`);
    });
    const on = generateCompareExpressionsData({
        numOperands: 4, maxOperand: 9, allowMultiplication: true, allowBrackets: true, allowNegative: false, numberOfProblems: 60,
    }).problems;
    const someBracketed = on.some(p => p.left.bracketStart !== -1 || p.right.bracketStart !== -1);
    assert(someBracketed, 'expected at least some brackets when allowBrackets=true');
}

function testEqualityIsExercised() {
    const { problems } = generateCompareExpressionsData({
        numOperands: 2,
        maxOperand: 10,
        allowMultiplication: true,
        allowBrackets: false,
        allowNegative: false,
        numberOfProblems: 50,
    });
    const equalityCount = problems.filter(p => p.comparison === '=').length;
    assert(equalityCount >= 3, `expected at least 3 equalities in 50 problems, got ${equalityCount}`);
    const ltCount = problems.filter(p => p.comparison === '<').length;
    const gtCount = problems.filter(p => p.comparison === '>').length;
    assert(ltCount >= 1 && gtCount >= 1, 'expected both < and > present');
}

function testInvalidInputs() {
    assert.throws(() => generateCompareExpressionsData({ numOperands: 0, maxOperand: 10, allowMultiplication: false, allowBrackets: false, allowNegative: false, numberOfProblems: 5 }));
    assert.throws(() => generateCompareExpressionsData({ numOperands: 5, maxOperand: 10, allowMultiplication: false, allowBrackets: false, allowNegative: false, numberOfProblems: 5 }));
    assert.throws(() => generateCompareExpressionsData({ numOperands: 2, maxOperand: 1, allowMultiplication: false, allowBrackets: false, allowNegative: false, numberOfProblems: 5 }));
    assert.throws(() => generateCompareExpressionsData({ numOperands: 2, maxOperand: 10, allowMultiplication: false, allowBrackets: false, allowNegative: false, numberOfProblems: 0 }));
}

testBasicShape();
testAllowNegativeFalse();
testAllowMultiplicationFalse();
testBracketsHonored();
testEqualityIsExercised();
testInvalidInputs();
console.log('All compare-expressions tests passed.');
