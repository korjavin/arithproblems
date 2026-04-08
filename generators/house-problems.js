import { getRandomInt } from '../utils.js';

export function generateHouseProblemsData({ range, numberOfProblems }) {
    if (!range || typeof range !== 'string' || !range.includes('-')) {
        throw new Error('Invalid range provided.');
    }
    const [min, max] = range.split('-').map(n => parseInt(n, 10));

    if (isNaN(min) || isNaN(max)) {
        throw new Error('Range contains non-numeric values.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];

    for (let i = 0; i < numberOfProblems; i++) {
        let num1, num2, sum;

        // Generate two numbers that, when added, stay within the max range
        do {
            num1 = getRandomInt(1, Math.floor(max / 2));
            num2 = getRandomInt(1, Math.floor(max / 2));
            sum = num1 + num2;
        } while (sum > max);

        // Randomly choose which number to hide (0 = left, 1 = center/sum, 2 = right)
        const missingPosition = getRandomInt(0, 2);

        problems.push({
            num1,
            num2,
            sum,
            missingPosition,
        });
    }

    return { problems };
}