import { generateOperatorPuzzlesData } from './generators/operator-puzzles.js';
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
    const { problems, controlSums } = generateOperatorPuzzlesData({
        numOperands: 4,
        maxOperand: 10,
        allowBrackets: false,
        mixOperandBlanks: false,
        numberOfProblems: 10,
    });
    assert.strictEqual(problems.length, 10);
    assert(Array.isArray(controlSums) && controlSums.length === 0, 'no self-check expected');
    problems.forEach((p, i) => {
        assert(Array.isArray(p.operands), `problem ${i} operands array`);
        assert.strictEqual(p.operands.length, 4, `problem ${i} numOperands`);
        assert.strictEqual(p.operators.length, 3, `problem ${i} num operators`);
        p.operators.forEach(op => assert(['+', '-', '*'].includes(op), `op ${op} allowed`));
        p.operands.forEach(n => assert(n >= 1 && n <= 10, `operand ${n} in range`));
        assert(Number.isInteger(p.target), `problem ${i} target is integer`);
        assert.strictEqual(p.blankKind, 'operators', `problem ${i} default blank kind`);
        assert.strictEqual(p.blankOperandIndex, null, `problem ${i} no operand blank`);
    });
}

function testEvaluatedTargetMatches() {
    const { problems } = generateOperatorPuzzlesData({
        numOperands: 5,
        maxOperand: 9,
        allowBrackets: true,
        mixOperandBlanks: false,
        numberOfProblems: 30,
    });
    problems.forEach((p, i) => {
        const computed = math.evaluate(exprString(p));
        assert.strictEqual(computed, p.target, `problem ${i} target equals evaluated expression`);
    });
}

function testBracketsHonored() {
    const off = generateOperatorPuzzlesData({
        numOperands: 4, maxOperand: 9, allowBrackets: false, mixOperandBlanks: false, numberOfProblems: 30,
    }).problems;
    off.forEach((p, i) => {
        assert.strictEqual(p.bracketStart, -1, `problem ${i} no brackets when allowBrackets=false`);
        assert.strictEqual(p.bracketEnd, -1, `problem ${i} no brackets when allowBrackets=false`);
    });
    const on = generateOperatorPuzzlesData({
        numOperands: 4, maxOperand: 9, allowBrackets: true, mixOperandBlanks: false, numberOfProblems: 60,
    }).problems;
    const someBracketed = on.some(p => p.bracketStart !== -1);
    assert(someBracketed, 'expected at least one bracketed problem when allowBrackets=true');
    on.forEach((p, i) => {
        if (p.bracketStart !== -1) {
            assert(p.bracketEnd > p.bracketStart, `problem ${i} bracket end > start`);
            assert(p.bracketStart >= 0 && p.bracketEnd < p.operands.length, `problem ${i} bracket within bounds`);
        }
    });
}

function testOperandBlanksMixed() {
    const off = generateOperatorPuzzlesData({
        numOperands: 4, maxOperand: 9, allowBrackets: false, mixOperandBlanks: false, numberOfProblems: 20,
    }).problems;
    assert(off.every(p => p.blankKind === 'operators'), 'all operators-blank when mix=false');

    const on = generateOperatorPuzzlesData({
        numOperands: 4, maxOperand: 9, allowBrackets: false, mixOperandBlanks: true, numberOfProblems: 60,
    }).problems;
    const someOperand = on.some(p => p.blankKind === 'operand');
    const someOps = on.some(p => p.blankKind === 'operators');
    assert(someOperand, 'expected some operand-blank when mix=true');
    assert(someOps, 'expected some operators-blank when mix=true');
    on.forEach((p, i) => {
        if (p.blankKind === 'operand') {
            assert(p.blankOperandIndex >= 0 && p.blankOperandIndex < p.operands.length,
                `problem ${i} operand index in range`);
        }
    });
}

function testTargetRange() {
    const { problems } = generateOperatorPuzzlesData({
        numOperands: 5, maxOperand: 10, allowBrackets: true, mixOperandBlanks: true, numberOfProblems: 50,
    });
    problems.forEach((p, i) => {
        assert(p.target >= -30 && p.target <= 200, `problem ${i} target ${p.target} in [-30, 200]`);
    });
}

function testInvalidInputs() {
    assert.throws(() => generateOperatorPuzzlesData({ numOperands: 2, maxOperand: 10, allowBrackets: false, mixOperandBlanks: false, numberOfProblems: 5 }));
    assert.throws(() => generateOperatorPuzzlesData({ numOperands: 4, maxOperand: 1, allowBrackets: false, mixOperandBlanks: false, numberOfProblems: 5 }));
    assert.throws(() => generateOperatorPuzzlesData({ numOperands: 4, maxOperand: 10, allowBrackets: false, mixOperandBlanks: false, numberOfProblems: 0 }));
}

testBasicShape();
testEvaluatedTargetMatches();
testBracketsHonored();
testOperandBlanksMixed();
testTargetRange();
testInvalidInputs();
console.log('All operator-puzzles tests passed.');
