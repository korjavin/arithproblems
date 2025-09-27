import { digitalRoot } from '../utils.js';

function getRandomNumber(numDigits) {
    if (numDigits <= 0) return 1;
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    // Special case for 1-digit numbers to avoid 0
    if (min === 1) return Math.floor(Math.random() * 9) + 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMultiplicationDivisionData({
    digitsF1,
    digitsF2,
    digitsDiv,
    digitsQuo,
    noRemainder,
    numberOfProblems,
}) {
    if (isNaN(digitsF1) || digitsF1 < 1 || digitsF1 > 4 || isNaN(digitsF2) || digitsF2 < 1 || digitsF2 > 4) {
        throw new Error('Invalid number of digits for multiplication factors.');
    }
    if (isNaN(digitsDiv) || digitsDiv < 1 || digitsDiv > 4 || isNaN(digitsQuo) || digitsQuo < 1 || digitsQuo > 3) {
        throw new Error('Invalid number of digits for division parts.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const answerRoots = [];

    for (let i = 0; i < numberOfProblems; i++) {
        let problemData;
        let actualResult;

        if (Math.random() < 0.5) {
            // Generate multiplication problem
            const factor1 = getRandomNumber(digitsF1);
            const factor2 = getRandomNumber(digitsF2);
            actualResult = factor1 * factor2;
            problemData = {
                type: 'multiplication',
                factor1,
                factor2,
                operator: '×',
            };
        } else {
            // Generate division problem
            let divisor = getRandomNumber(digitsDiv);
            let quotient = getRandomNumber(digitsQuo);

            if (divisor === 0) divisor = 1; // Avoid division by zero
            if (quotient === 0) quotient = 1;

            let dividend;
            if (noRemainder) {
                dividend = divisor * quotient;
                actualResult = quotient;
            } else {
                const remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
                dividend = divisor * quotient + remainder;
                actualResult = quotient; // We track the quotient for the digital root
            }

            problemData = {
                type: 'division',
                dividend,
                divisor,
                operator: '÷',
            };
        }

        problems.push(problemData);
        answerRoots.push({ root: digitalRoot(actualResult) });
    }

    return { problems, answerRoots };
}