import { gcd, digitalRoot } from '../utils.js';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateProportionData({ maxBase, maxMultiplier, simplifyRatios, numberOfProblems }) {
    if (isNaN(maxBase) || maxBase < 1 || maxBase > 15) {
        throw new Error('Max base must be between 1 and 15.');
    }
    if (isNaN(maxMultiplier) || maxMultiplier < 2 || maxMultiplier > 12) {
        throw new Error('Max multiplier must be between 2 and 12.');
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
        let a = getRandomInt(1, maxBase);
        let b = getRandomInt(1, maxBase);

        if (simplifyRatios) {
            const commonDivisor = gcd(a, b);
            if (commonDivisor > 1) {
                a /= commonDivisor;
                b /= commonDivisor;
            }
        }
        if (a === b && a === 1) continue; // Avoid trivial 1/1 = k/k

        const k = getRandomInt(2, maxMultiplier);
        const c = a * k;
        const d = b * k;

        const positions = ['a', 'b', 'c', 'd'];
        const hiddenPosition = positions[Math.floor(Math.random() * 4)];

        let solution = 0;
        switch (hiddenPosition) {
            case 'a': solution = a; break;
            case 'b': solution = b; break;
            case 'c': solution = c; break;
            case 'd': solution = d; break;
        }

        problems.push({
            a, b, c, d,
            hiddenPosition,
        });

        digitalRoots.push({
            digitalRoot: digitalRoot(solution),
        });
    }

    if (problems.length < numberOfProblems) {
        console.warn(`Could only generate ${problems.length}/${numberOfProblems} proportion problems with the given constraints.`);
    }

    return { problems, digitalRoots };
}