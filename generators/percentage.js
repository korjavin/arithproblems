import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

function getRandomPercentage(wholePercentsOnly) {
    if (wholePercentsOnly) {
        return getRandomInt(1, 99);
    }
    // 0.1 increments
    return Math.round((getRandomInt(10, 1000) / 10) * 10) / 10;
}

export function generatePercentageData({ problemType, maxNumber, wholePercentsOnly, numberOfProblems }) {
    if (isNaN(maxNumber) || maxNumber < 10) {
        throw new Error('Max number must be at least 10.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const digitalRoots = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const currentProblemType =
            problemType === 'mixed'
                ? getRandomFromArray(['find-percent', 'find-what-percent', 'find-whole'])
                : problemType;

        let problemData = {};
        let answer = 0;

        if (currentProblemType === 'find-percent') {
            // Find X% of Y (e.g., "25% of 80 = ?")
            const percentage = getRandomPercentage(wholePercentsOnly);
            const number = getRandomInt(10, maxNumber);
            answer = Math.round((percentage / 100) * number);
            problemData = { type: 'find-percent', percentage, number };
        } else if (currentProblemType === 'find-what-percent') {
            // Find what percent X is of Y (e.g., "15 is what % of 60?")
            const whole = getRandomInt(20, maxNumber);
            const percentage = getRandomPercentage(wholePercentsOnly);
            const part = Math.round((percentage / 100) * whole);
            answer = Math.round(percentage);
            problemData = { type: 'find-what-percent', part, whole };
        } else if (currentProblemType === 'find-whole') {
            // Find the whole when given part and percentage (e.g., "25% of what number is 20?")
            const percentage = getRandomPercentage(wholePercentsOnly);
            const part = getRandomInt(5, Math.floor(maxNumber * 0.6));
            answer = Math.round(part / (percentage / 100));
            problemData = { type: 'find-whole', percentage, part };
        }

        problems.push(problemData);
        digitalRoots.push({ digitalRoot: digitalRoot(answer) });
    }

    return { problems, digitalRoots };
}