import { digitalRoot } from '../utils.js';

function getRandomNumber(numDigits) {
    if (numDigits <= 0) return 0;
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateAdditionSubtractionData({ digits1, digits2, numberOfProblems }) {
    if (isNaN(digits1) || digits1 < 1 || digits1 > 7 || isNaN(digits2) || digits2 < 1 || digits2 > 7) {
        throw new Error('Invalid number of digits specified.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const answerRoots = [];

    for (let i = 0; i < numberOfProblems; i++) {
        let num1 = getRandomNumber(digits1);
        let num2 = getRandomNumber(digits2);
        const isAddition = Math.random() < 0.5;
        let operator, actualResult;

        if (isAddition) {
            operator = '+';
            actualResult = num1 + num2;
        } else {
            operator = '–'; // Use en dash for subtraction
            if (num1 < num2) {
                [num1, num2] = [num2, num1]; // Ensure the result is not negative
            }
            actualResult = num1 - num2;
        }

        problems.push({
            num1,
            num2,
            operator
        });

        answerRoots.push({
            root: digitalRoot(actualResult)
        });
    }

    return { problems, answerRoots };
}