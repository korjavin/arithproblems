import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

function generateArithmetic({ numTerms, maxValue, allowNegative }) {
    const aMin = allowNegative ? -Math.min(20, maxValue) : 0;
    const aMax = Math.min(20, maxValue);
    const dMin = allowNegative ? -9 : 1;
    const dMax = 9;
    for (let attempt = 0; attempt < 60; attempt++) {
        const a = getRandomInt(aMin, aMax);
        const d = getRandomInt(dMin, dMax);
        if (d === 0) continue;
        const terms = Array.from({ length: numTerms + 1 }, (_, i) => a + i * d);
        const ok = terms.every(t => Math.abs(t) <= maxValue && (allowNegative || t >= 0));
        if (ok) {
            return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'arithmetic' };
        }
    }
    const terms = Array.from({ length: numTerms + 1 }, (_, i) => 1 + i);
    return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'arithmetic' };
}

function generateGeometric({ numTerms, maxValue, allowNegative }) {
    const ratios = allowNegative ? [2, 3, -2] : [2, 3];
    for (let attempt = 0; attempt < 60; attempt++) {
        const a = getRandomInt(1, Math.min(5, maxValue));
        const r = getRandomFromArray(ratios);
        const terms = [a];
        for (let i = 1; i <= numTerms; i++) terms.push(terms[i - 1] * r);
        const ok = terms.every(t => Math.abs(t) <= maxValue && (allowNegative || t >= 0));
        if (ok) {
            return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'geometric' };
        }
    }
    const terms = [1, 2, 4, 8, 16, 32, 64].slice(0, numTerms + 1);
    return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'geometric' };
}

function generateSquares({ numTerms, maxValue }) {
    const maxStart = Math.max(1, Math.floor(Math.sqrt(maxValue)) - numTerms);
    for (let attempt = 0; attempt < 30; attempt++) {
        const start = getRandomInt(1, Math.max(1, maxStart));
        const terms = Array.from({ length: numTerms + 1 }, (_, i) => (start + i) ** 2);
        if (terms.every(t => t <= maxValue)) {
            return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'squares' };
        }
    }
    const terms = Array.from({ length: numTerms + 1 }, (_, i) => (1 + i) ** 2);
    return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'squares' };
}

function generateAlternating({ numTerms, maxValue, allowNegative }) {
    const muls = [2, 3];
    const addsPositive = [1, 2, 3, 4, 5];
    const addsAll = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
    for (let attempt = 0; attempt < 80; attempt++) {
        const start = getRandomInt(1, Math.min(10, maxValue));
        const mul = getRandomFromArray(muls);
        const add = getRandomFromArray(allowNegative ? addsAll : addsPositive);
        const opSpecs = [{ kind: 'mul', val: mul }, { kind: 'add', val: add }];
        const order = getRandomInt(0, 1) === 0 ? [0, 1] : [1, 0];
        const apply = (v, op) => op.kind === 'mul' ? v * op.val : v + op.val;
        const terms = [start];
        for (let i = 0; i < numTerms; i++) terms.push(apply(terms[i], opSpecs[order[i % 2]]));
        const ok = terms.every(t => Math.abs(t) <= maxValue && (allowNegative || t >= 0));
        if (ok) {
            return {
                terms: terms.slice(0, numTerms),
                answer: terms[numTerms],
                type: 'alternating',
                meta: { ops: order.map(i => opSpecs[i]) },
            };
        }
    }
    const terms = [1];
    for (let i = 0; i < numTerms; i++) terms.push(i % 2 === 0 ? terms[i] * 2 : terms[i] + 1);
    return {
        terms: terms.slice(0, numTerms),
        answer: terms[numTerms],
        type: 'alternating',
        meta: { ops: [{ kind: 'mul', val: 2 }, { kind: 'add', val: 1 }] },
    };
}

function generateFibonacci({ numTerms, maxValue }) {
    for (let attempt = 0; attempt < 30; attempt++) {
        const a = getRandomInt(1, 5);
        const b = getRandomInt(1, 5);
        const terms = [a, b];
        for (let i = 2; i <= numTerms; i++) terms.push(terms[i - 1] + terms[i - 2]);
        if (terms.every(t => t <= maxValue)) {
            return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'fibonacci' };
        }
    }
    const terms = [1, 1];
    for (let i = 2; i <= numTerms; i++) terms.push(terms[i - 1] + terms[i - 2]);
    return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'fibonacci' };
}

const generators = {
    arithmetic: generateArithmetic,
    geometric: generateGeometric,
    squares: generateSquares,
    fibonacci: generateFibonacci,
    alternating: generateAlternating,
};

export function generateNumberSequencesData({ types, numTerms, maxValue, allowNegative = false, numberOfProblems }) {
    if (!Array.isArray(types) || types.length === 0) {
        throw new Error('At least one sequence type must be selected.');
    }
    const valid = types.filter(t => t in generators);
    if (valid.length === 0) {
        throw new Error('No valid sequence types selected.');
    }
    if (!Number.isFinite(numTerms) || numTerms < 3 || numTerms > 6) {
        throw new Error('Invalid number of terms.');
    }
    if (!Number.isFinite(maxValue) || maxValue < 10) {
        throw new Error('Invalid max value.');
    }
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) {
        throw new Error('Invalid number of problems.');
    }

    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const type = valid[getRandomInt(0, valid.length - 1)];
        const problem = generators[type]({ numTerms, maxValue, allowNegative });
        problems.push(problem);
        controlSums.push({ controlSum: digitalRoot(problem.answer) });
    }

    return { problems, controlSums };
}
