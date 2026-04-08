import { digitalRoot, getRandomInt, getRandomNumberByDigits } from '../utils.js';

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

        if (getRandomInt(0, 1) === 0) {
            // Generate multiplication problem
            const factor1 = getRandomNumberByDigits(digitsF1);
            const factor2 = getRandomNumberByDigits(digitsF2);
            actualResult = factor1 * factor2;
            problemData = {
                type: 'multiplication',
                factor1,
                factor2,
                operator: '×',
            };
        } else {
            // Generate division problem
            let divisor = getRandomNumberByDigits(digitsDiv);
            let quotient = getRandomNumberByDigits(digitsQuo);

            if (divisor === 0) divisor = 1; // Avoid division by zero
            if (quotient === 0) quotient = 1;

            let dividend;
            if (noRemainder) {
                dividend = divisor * quotient;
                actualResult = quotient;
            } else {
                const remainder = getRandomInt(1, divisor - 1);
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