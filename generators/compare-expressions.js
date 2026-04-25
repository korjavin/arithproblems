import { create, all } from 'mathjs';
import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

const math = create(all);

function buildSide({ numOperands, maxOperand, allowedOps, allowBrackets }) {
    const operands = Array.from({ length: numOperands }, () => getRandomInt(1, maxOperand));
    const operators = Array.from({ length: Math.max(0, numOperands - 1) }, () => getRandomFromArray(allowedOps));
    let bracketStart = -1, bracketEnd = -1;
    if (allowBrackets && numOperands >= 3 && getRandomInt(0, 2) === 0) {
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

function evaluateSide(side) {
    return math.evaluate(expressionString(side));
}

const VALUE_MIN = -50;
const VALUE_MAX = 200;

function inRange(v, allowNegative) {
    if (!Number.isInteger(v)) return false;
    if (!allowNegative && v < 0) return false;
    return v >= VALUE_MIN && v <= VALUE_MAX;
}

export function generateCompareExpressionsData({
    numOperands,
    maxOperand,
    allowMultiplication,
    allowBrackets,
    allowNegative,
    numberOfProblems,
}) {
    if (!Number.isFinite(numOperands) || numOperands < 1 || numOperands > 4) {
        throw new Error('Invalid number of operands per side.');
    }
    if (!Number.isFinite(maxOperand) || maxOperand < 2 || maxOperand > 30) {
        throw new Error('Invalid max operand.');
    }
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) {
        throw new Error('Invalid number of problems.');
    }

    const allowedOps = ['+', '-'];
    if (allowMultiplication) allowedOps.push('*');

    const buildOpts = { numOperands, maxOperand, allowedOps, allowBrackets };
    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const wantEqual = getRandomInt(0, 3) === 0; // ~25% try to engineer equality
        let problem = null;

        for (let attempt = 0; attempt < 80 && !problem; attempt++) {
            const left = buildSide(buildOpts);
            const lv = evaluateSide(left);
            if (!inRange(lv, allowNegative)) continue;

            let right = null;
            let rv = null;
            if (wantEqual) {
                for (let inner = 0; inner < 30; inner++) {
                    const candidate = buildSide(buildOpts);
                    const value = evaluateSide(candidate);
                    if (inRange(value, allowNegative) && value === lv) {
                        right = candidate;
                        rv = value;
                        break;
                    }
                }
            }
            if (!right) {
                right = buildSide(buildOpts);
                rv = evaluateSide(right);
                if (!inRange(rv, allowNegative)) continue;
            }

            const cmp = lv < rv ? '<' : lv > rv ? '>' : '=';
            problem = { left, right, leftValue: lv, rightValue: rv, comparison: cmp };
        }

        if (!problem) {
            const fallback = { operands: [1, 2], operators: ['+'], bracketStart: -1, bracketEnd: -1 };
            problem = {
                left: fallback,
                right: { ...fallback, operands: [2, 1] },
                leftValue: 3,
                rightValue: 3,
                comparison: '=',
            };
        }
        problems.push(problem);
        // Self-check: digital root of the larger side (use either value if they're equal).
        // Forces the student to commit to a comparison (to know which side to take) but
        // reveals nothing about whether the answer is <, =, or >.
        controlSums.push({ controlSum: digitalRoot(Math.max(problem.leftValue, problem.rightValue)) });
    }

    return { problems, controlSums };
}
