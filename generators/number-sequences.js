import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

function generateArithmetic({ numTerms, maxValue }) {
    for (let attempt = 0; attempt < 60; attempt++) {
        const a = getRandomInt(-Math.min(20, maxValue), Math.min(20, maxValue));
        const d = getRandomInt(-9, 9);
        if (d === 0) continue;
        const terms = Array.from({ length: numTerms + 1 }, (_, i) => a + i * d);
        if (terms.every(t => Math.abs(t) <= maxValue)) {
            return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'arithmetic' };
        }
    }
    const terms = Array.from({ length: numTerms + 1 }, (_, i) => 1 + i);
    return { terms: terms.slice(0, numTerms), answer: terms[numTerms], type: 'arithmetic' };
}

function generateGeometric({ numTerms, maxValue }) {
    const ratios = [2, 3, -2];
    for (let attempt = 0; attempt < 60; attempt++) {
        const a = getRandomInt(1, Math.min(5, maxValue));
        const r = getRandomFromArray(ratios);
        const terms = [a];
        for (let i = 1; i <= numTerms; i++) terms.push(terms[i - 1] * r);
        if (terms.every(t => Math.abs(t) <= maxValue)) {
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
};

export function generateNumberSequencesData({ types, numTerms, maxValue, numberOfProblems }) {
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
        const problem = generators[type]({ numTerms, maxValue });
        problems.push(problem);
        controlSums.push({ controlSum: digitalRoot(problem.answer) });
    }

    return { problems, controlSums };
}
