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

export function generateRationalMultDivData({ maxVal, avoidWholeNums, numberOfProblems }) {
    if (isNaN(maxVal) || maxVal < 1) {
        throw new Error('Max value must be a positive number.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const controlSumsArray = [];
    let attempts = 0;
    const maxAttempts = numberOfProblems * 100; // Prevent infinite loops

    while (problems.length < numberOfProblems && attempts < maxAttempts) {
        attempts++;
        let n1 = getRandomInt(1, maxVal);
        let d1 = getRandomInt(1, maxVal);
        let n2 = getRandomInt(1, maxVal);
        let d2 = getRandomInt(1, maxVal);

        const operation = Math.random() < 0.5 ? 'multiply' : 'divide';
        let resultN, resultD;

        if (operation === 'multiply') {
            resultN = n1 * n2;
            resultD = d1 * d2;
        } else { // divide
            if (n2 === 0) continue; // Avoid division by zero in the problem itself
            resultN = n1 * d2;
            resultD = d1 * n2;
        }

        if (resultD === 0) continue; // Avoid division by zero in the result

        const commonDivisor = gcd(resultN, resultD);
        const finalN = resultN / commonDivisor;
        let finalD = resultD / commonDivisor;

        if (finalD < 0) {
            finalD = -finalD;
        }

        if (avoidWholeNums && finalD === 1) {
            continue;
        }

        problems.push({
            n1,
            d1,
            n2,
            d2,
            operation,
        });

        controlSumsArray.push({
            controlSum: calculateControlSum(finalN, finalD),
        });
    }

    if (problems.length < numberOfProblems && avoidWholeNums) {
        console.warn(`Could only generate ${problems.length}/${numberOfProblems} problems while avoiding whole number results.`);
    }

    return { problems, controlSumsArray };
}