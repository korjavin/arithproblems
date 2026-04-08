import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

function getRandomCoefficient(coefficientRange) {
    return getRandomInt(1, coefficientRange);
}

function getRandomSolution(solutionRange, allowNegativeSolutions) {
    const sol = getRandomInt(1, solutionRange);
    return allowNegativeSolutions && getRandomInt(1, 100) <= 30 ? -sol : sol;
}

export function generateLinearEquationsData({ equationType, coefficientRange, solutionRange, allowNegativeSolutions, includeBrackets, numberOfProblems }) {
    if (isNaN(coefficientRange) || coefficientRange < 1 || coefficientRange > 10) {
        throw new Error('Coefficient range must be between 1 and 10.');
    }
    if (isNaN(solutionRange) || solutionRange < 1 || solutionRange > 50) {
        throw new Error('Solution range must be between 1 and 50.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const digitalRoots = [];
    const availableTypes = ['one-step', 'two-step', 'with-fractions'];
    if (includeBrackets) {
        availableTypes.push('with-brackets');
    }

    for (let i = 0; i < numberOfProblems; i++) {
        const currentEquationType = equationType === 'mixed' ? getRandomFromArray(availableTypes) : equationType;

        let problemData = { type: currentEquationType };
        let solution = getRandomSolution(solutionRange, allowNegativeSolutions);

        if (currentEquationType === 'one-step') {
            const operationType = getRandomInt(0, 2);
            if (operationType === 0) { // x + a = b
                const a = getRandomCoefficient(coefficientRange);
                const b = solution + a;
                problemData = { ...problemData, text: `x + ${a} = ${b}` };
            } else if (operationType === 1) { // x - a = b
                const a = getRandomCoefficient(coefficientRange);
                const b = solution - a;
                problemData = { ...problemData, text: `x - ${a} = ${b}` };
            } else { // a - x = b
                const a = Math.abs(solution) + getRandomCoefficient(coefficientRange);
                const b = a - solution;
                problemData = { ...problemData, text: `${a} - x = ${b}` };
            }
        } else if (currentEquationType === 'two-step') {
            const a = getRandomCoefficient(coefficientRange);
            const b = getRandomCoefficient(coefficientRange);
            if (getRandomInt(0, 1) === 0) { // ax + b = c
                const c = a * solution + b;
                problemData = { ...problemData, text: `${a}x + ${b} = ${c}` };
            } else { // ax - b = c
                const c = a * solution - b;
                problemData = { ...problemData, text: `${a}x - ${b} = ${c}` };
            }
        } else if (currentEquationType === 'with-fractions') {
            const a = getRandomInt(2, Math.min(coefficientRange, 5));
            const b = getRandomCoefficient(coefficientRange);
            const c = Math.round(solution / a) + b;
            solution = a * (c - b); // Adjust solution to be an integer
            problemData = { ...problemData, text: `x/${a} + ${b} = ${c}` };
        } else if (currentEquationType === 'with-brackets') {
            const bracketType = getRandomInt(0, 4);

            if (bracketType === 0) { // a(x + b) = c
                const a = getRandomCoefficient(coefficientRange);
                const b = getRandomCoefficient(coefficientRange);
                const c = a * (solution + b);
                problemData = { ...problemData, text: `${a}(x + ${b}) = ${c}` };
            } else if (bracketType === 1) { // a(x - b) = c
                const a = getRandomCoefficient(coefficientRange);
                const b = getRandomCoefficient(coefficientRange);
                const c = a * (solution - b);
                problemData = { ...problemData, text: `${a}(x - ${b}) = ${c}` };
            } else if (bracketType === 2) { // (x + a) + b = c
                const a = getRandomCoefficient(coefficientRange);
                const b = getRandomCoefficient(coefficientRange);
                const c = solution + a + b;
                problemData = { ...problemData, text: `(x + ${a}) + ${b} = ${c}` };
            } else if (bracketType === 3) { // a(bx + c) = d
                const a = getRandomCoefficient(Math.min(coefficientRange, 3));
                const b = getRandomCoefficient(Math.min(coefficientRange, 3));
                const c = getRandomCoefficient(coefficientRange);
                const d = a * (b * solution + c);
                problemData = { ...problemData, text: `${a}(${b}x + ${c}) = ${d}` };
            } else { // a + b(x + c) = d
                const a = getRandomCoefficient(coefficientRange);
                const b = getRandomCoefficient(coefficientRange);
                const c = getRandomCoefficient(coefficientRange);
                const d = a + b * (solution + c);
                problemData = { ...problemData, text: `${a} + ${b}(x + ${c}) = ${d}` };
            }
        }

        problems.push(problemData);
        digitalRoots.push({ digitalRoot: digitalRoot(Math.abs(solution)) });
    }

    return { problems, digitalRoots };
}