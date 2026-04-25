import { create, all } from 'mathjs';
import { getRandomInt, getRandomFromArray } from '../utils.js';

const math = create(all);

const ALLOWED_OPS = ['+', '-', '*'];

function buildExpression({ numOperands, maxOperand, allowBrackets }) {
    const operands = Array.from({ length: numOperands }, () => getRandomInt(1, maxOperand));
    const operators = Array.from({ length: numOperands - 1 }, () => getRandomFromArray(ALLOWED_OPS));

    let bracketStart = -1;
    let bracketEnd = -1;
    // Brackets only matter when at least one operator outside the bracket has higher precedence
    // than at least one inside, or vice versa — we don't enforce that, but rolling a 50% chance
    // gives variety.
    if (allowBrackets && numOperands >= 3 && getRandomInt(0, 1) === 0) {
        const len = getRandomInt(2, numOperands - 1);
        bracketStart = getRandomInt(0, numOperands - len);
        bracketEnd = bracketStart + len - 1;
    }

    return { operands, operators, bracketStart, bracketEnd };
}

function expressionString({ operands, operators, bracketStart, bracketEnd }) {
    let s = '';
    for (let i = 0; i < operands.length; i++) {
        if (i === bracketStart) s += '(';
        s += operands[i];
        if (i === bracketEnd) s += ')';
        if (i < operators.length) s += ` ${operators[i]} `;
    }
    return s;
}

function evaluateExpression(expr) {
    return math.evaluate(expressionString(expr));
}

export function generateOperatorPuzzlesData({
    numOperands,
    maxOperand,
    allowBrackets,
    mixOperandBlanks,
    numberOfProblems,
}) {
    if (!Number.isFinite(numOperands) || numOperands < 3 || numOperands > 6) {
        throw new Error('Invalid number of operands.');
    }
    if (!Number.isFinite(maxOperand) || maxOperand < 2 || maxOperand > 20) {
        throw new Error('Invalid max operand.');
    }
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) {
        throw new Error('Invalid number of problems.');
    }

    const problems = [];
    const TARGET_MIN = -30;
    const TARGET_MAX = 200;

    for (let i = 0; i < numberOfProblems; i++) {
        let expr = null;
        let target = null;
        for (let attempt = 0; attempt < 50; attempt++) {
            const candidate = buildExpression({ numOperands, maxOperand, allowBrackets });
            const value = evaluateExpression(candidate);
            if (!Number.isInteger(value)) continue;
            if (value < TARGET_MIN || value > TARGET_MAX) continue;
            expr = candidate;
            target = value;
            break;
        }
        if (expr === null) {
            // Fallback: simple all-plus
            expr = {
                operands: Array.from({ length: numOperands }, (_, k) => k + 1),
                operators: Array.from({ length: numOperands - 1 }, () => '+'),
                bracketStart: -1,
                bracketEnd: -1,
            };
            target = evaluateExpression(expr);
        }

        const blankKind = mixOperandBlanks && getRandomInt(0, 1) === 0 ? 'operand' : 'operators';
        const blankOperandIndex = blankKind === 'operand' ? getRandomInt(0, numOperands - 1) : null;

        problems.push({ ...expr, target, blankKind, blankOperandIndex });
    }

    return { problems, controlSums: [] };
}
