import { gcd, digitalRoot } from '../utils.js';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const TERMINATING_DENOMINATORS = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50, 100, 125, 200, 250, 400, 500, 1000];

export function generateDecimalRationalData({ problemMix, maxDecimalPlaces, terminatingOnly, numberOfProblems }) {
    if (isNaN(maxDecimalPlaces) || maxDecimalPlaces < 1 || maxDecimalPlaces > 4) {
        throw new Error('Max decimal places must be between 1 and 4.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const digitalRoots = [];
    let attempts = 0;
    const maxAttempts = numberOfProblems * 100;

    while (problems.length < numberOfProblems && attempts < maxAttempts) {
        attempts++;
        const problemType = (problemMix === 'mixed') ? (Math.random() < 0.5 ? 'fraction-to-decimal' : 'decimal-to-fraction') : problemMix;

        let problemData = null;
        let checkNumber = 0;

        if (problemType === 'fraction-to-decimal') {
            let denominator, numerator;
            if (terminatingOnly) {
                denominator = TERMINATING_DENOMINATORS[getRandomInt(0, TERMINATING_DENOMINATORS.length - 1)];
                numerator = getRandomInt(1, denominator - 1);
            } else {
                denominator = getRandomInt(2, 20);
                numerator = getRandomInt(1, denominator - 1);
            }

            const commonFactor = gcd(numerator, denominator);
            numerator /= commonFactor;
            denominator /= commonFactor;

            const decimalAnswer = numerator / denominator;
            const decimalStr = decimalAnswer.toString();
            const decimalPlaces = decimalStr.includes('.') ? decimalStr.split('.')[1].length : 0;

            if (terminatingOnly && (decimalPlaces > maxDecimalPlaces || !isFinite(decimalAnswer))) {
                continue;
            }

            const decimalWithoutPoint = decimalStr.replace('.', '');
            checkNumber = digitalRoot(parseInt(decimalWithoutPoint, 10));
            problemData = { type: 'fraction-to-decimal', numerator, denominator };

        } else { // decimal-to-fraction
            let decimalAnswer, n, d;
            if (terminatingOnly) {
                const places = getRandomInt(1, maxDecimalPlaces);
                const multiplier = Math.pow(10, places);
                n = getRandomInt(1, multiplier - 1);
                d = multiplier;
                decimalAnswer = n / d;
            } else {
                decimalAnswer = getRandomInt(1, 999) / Math.pow(10, getRandomInt(1, maxDecimalPlaces));
                const decimalStr = decimalAnswer.toString();
                const parts = decimalStr.split('.');
                n = parseInt(parts[0] + parts[1], 10);
                d = Math.pow(10, parts[1].length);
            }

            const commonFactor = gcd(n, d);
            const finalN = n / commonFactor;
            const finalD = d / commonFactor;

            checkNumber = digitalRoot(finalN + finalD);
            problemData = { type: 'decimal-to-fraction', decimal: decimalAnswer };
        }

        problems.push(problemData);
        digitalRoots.push({ digitalRoot: checkNumber });
    }

    if (problems.length < numberOfProblems) {
        console.warn(`Could only generate ${problems.length}/${numberOfProblems} decimal/rational problems with the given constraints.`);
    }

    return { problems, digitalRoots };
}