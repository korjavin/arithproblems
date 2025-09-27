import { gcd } from '../utils.js';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateControlSum(numerator, denominator) {
    if (denominator === 0) return NaN;
    if (numerator === 0) return denominator;
    if (denominator === 1) return 1;
    if (Math.abs(numerator) < denominator) return Math.abs(numerator) + denominator;
    return (Math.abs(numerator) % denominator) + denominator;
}

export function generateRationalOperationsData({ numTerms, maxVal, numberOfProblems }) {
    if (isNaN(numTerms) || numTerms < 2 || numTerms > 5) {
        throw new Error('Number of terms must be between 2 and 5.');
    }
    if (isNaN(maxVal) || maxVal < 1) {
        throw new Error('Max value must be a positive number.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const controlSumsArray = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const fractions = [];
        const operations = [];

        for (let j = 0; j < numTerms; j++) {
            fractions.push({
                numerator: getRandomInt(1, maxVal),
                denominator: getRandomInt(1, maxVal),
            });
            if (j < numTerms - 1) {
                operations.push(Math.random() < 0.5 ? 'add' : 'subtract');
            }
        }

        // Calculate the result for the control sum
        let resultN = fractions[0].numerator;
        let resultD = fractions[0].denominator;

        for (let j = 1; j < numTerms; j++) {
            const n2 = fractions[j].numerator;
            const d2 = fractions[j].denominator;
            const operation = operations[j - 1];

            if (operation === 'add') {
                resultN = resultN * d2 + n2 * resultD;
                resultD = resultD * d2;
            } else {
                resultN = resultN * d2 - n2 * resultD;
                resultD = resultD * d2;
            }
        }

        if (resultD === 0) {
            i--; // Retry this problem
            continue;
        }

        const commonDivisor = gcd(resultN, resultD);
        const finalN = resultN / commonDivisor;
        let finalD = resultD / commonDivisor;

        if (finalD < 0) {
            finalD = -finalD;
        }

        controlSumsArray.push({
            controlSum: calculateControlSum(finalN, finalD),
        });

        problems.push({
            fractions,
            operations,
        });
    }

    return { problems, controlSumsArray };
}