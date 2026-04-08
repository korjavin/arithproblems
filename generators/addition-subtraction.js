import { digitalRoot, getRandomInt, getRandomNumberByDigits } from '../utils.js';

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
        let num1 = getRandomNumberByDigits(digits1, false);
        let num2 = getRandomNumberByDigits(digits2, false);
        const isAddition = getRandomInt(0, 1) === 0;
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