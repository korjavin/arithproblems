import { gcd } from '../utils.js';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateControlSum(numerator, denominator) {
    if (denominator === 0) return NaN;
    if (numerator === 0) return denominator;
    if (denominator === 1) return 1;
    if (numerator < denominator) return numerator + denominator;
    return (numerator % denominator) + denominator;
}

export function generateRationalCanonicalData({ maxVal, ensureReducible, numberOfProblems }) {
    if (isNaN(maxVal) || maxVal < 2) {
        throw new Error('Max value must be a number greater than or equal to 2.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const simplifiedAnswers = [];
    let generationAttempts = 0;
    const MAX_ATTEMPTS_PER_PROBLEM = 100;

    while (problems.length < numberOfProblems && generationAttempts < numberOfProblems * MAX_ATTEMPTS_PER_PROBLEM) {
        generationAttempts++;
        let numerator = getRandomInt(1, maxVal);
        let denominator = getRandomInt(1, maxVal);

        if (denominator === 0) continue;
        if (numerator >= denominator) continue; // Keep fractions proper for simplicity

        const commonDivisor = gcd(numerator, denominator);

        if (ensureReducible && commonDivisor === 1) {
            // If we need a reducible fraction, find a common factor and multiply
            const factor = getRandomInt(2, Math.floor(maxVal / denominator));
            numerator *= factor;
            denominator *= factor;
            if (gcd(numerator, denominator) === factor) {
                 // good, we created a reducible fraction
            } else {
                continue; // something went wrong, try again
            }
        } else if (!ensureReducible && commonDivisor > 1) {
            // If we don't need reducible, but got one, we can simplify it to make it irreducible
            // This increases variety.
            numerator /= commonDivisor;
            denominator /= commonDivisor;
        }

        if (gcd(numerator, denominator) === 1 && ensureReducible) continue;


        const simplifiedN = numerator / gcd(numerator, denominator);
        const simplifiedD = denominator / gcd(numerator, denominator);

        simplifiedAnswers.push({
            controlSum: calculateControlSum(simplifiedN, simplifiedD),
        });

        problems.push({
            numerator,
            denominator,
        });
    }

    if (problems.length < numberOfProblems && ensureReducible) {
        console.warn(`Could only generate ${problems.length}/${numberOfProblems} reducible fractions with the given constraints.`);
    }

    return { problems, simplifiedAnswers };
}