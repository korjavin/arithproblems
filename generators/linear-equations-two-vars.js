import { digitalRoot } from '../utils.js';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCoefficient(coefficientRange, allowZero = false) {
    if (allowZero) {
        return getRandomInt(-coefficientRange, coefficientRange);
    }
    const val = getRandomInt(1, coefficientRange);
    return Math.random() < 0.5 ? val : -val;
}

function getRandomSolution(solutionRange, allowNegativeSolutions) {
    const sol = getRandomInt(1, solutionRange);
    return allowNegativeSolutions && Math.random() < 0.3 ? -sol : sol;
}

function formatCoefficient(coeff, variable, isFirst = false) {
    if (coeff === 0) return '';

    let sign = '';
    let absCoeff = Math.abs(coeff);

    if (isFirst) {
        sign = coeff < 0 ? '-' : '';
    } else {
        sign = coeff < 0 ? ' - ' : ' + ';
    }

    if (absCoeff === 1) {
        return `${sign}${variable}`;
    }
    return `${sign}${absCoeff}${variable}`;
}

function formatEquation(a, b, c) {
    let equation = '';

    // Handle x coefficient
    if (a !== 0) {
        equation += formatCoefficient(a, 'x', true);
    }

    // Handle y coefficient
    if (b !== 0) {
        const isFirst = equation === '';
        equation += formatCoefficient(b, 'y', isFirst);
    }

    // If both coefficients are 0, make it "0"
    if (equation === '') {
        equation = '0';
    }

    equation += ` = ${c}`;
    return equation;
}

export function generateLinearEquationsTwoVarsData({
    systemType,
    coefficientRange,
    solutionRange,
    allowNegativeSolutions,
    integerSolutionsOnly,
    numberOfProblems
}) {
    if (isNaN(coefficientRange) || coefficientRange < 1 || coefficientRange > 10) {
        throw new Error('Coefficient range must be between 1 and 10.');
    }
    if (isNaN(solutionRange) || solutionRange < 1 || solutionRange > 20) {
        throw new Error('Solution range must be between 1 and 20.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const digitalRoots = [];
    const availableTypes = ['elimination-friendly', 'substitution-friendly', 'general'];

    for (let i = 0; i < numberOfProblems; i++) {
        const currentSystemType = systemType === 'mixed' ?
            availableTypes[Math.floor(Math.random() * availableTypes.length)] :
            systemType;

        let x, y, a1, b1, c1, a2, b2, c2;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            attempts++;
            // Generate solution first
            x = getRandomSolution(solutionRange, allowNegativeSolutions);
            y = getRandomSolution(solutionRange, allowNegativeSolutions);

            if (currentSystemType === 'elimination-friendly') {
                // Make coefficients that are easy to eliminate
                if (Math.random() < 0.5) {
                    // Same x coefficients
                    a1 = getRandomCoefficient(coefficientRange);
                    a2 = Math.random() < 0.5 ? a1 : -a1;
                    b1 = getRandomCoefficient(coefficientRange);
                    b2 = getRandomCoefficient(coefficientRange);
                } else {
                    // Same y coefficients
                    b1 = getRandomCoefficient(coefficientRange);
                    b2 = Math.random() < 0.5 ? b1 : -b1;
                    a1 = getRandomCoefficient(coefficientRange);
                    a2 = getRandomCoefficient(coefficientRange);
                }
            } else if (currentSystemType === 'substitution-friendly') {
                // Make one coefficient 1 or -1 for easy substitution
                if (Math.random() < 0.5) {
                    a1 = Math.random() < 0.5 ? 1 : -1;
                    b1 = getRandomCoefficient(coefficientRange);
                    a2 = getRandomCoefficient(coefficientRange);
                    b2 = getRandomCoefficient(coefficientRange);
                } else {
                    b1 = Math.random() < 0.5 ? 1 : -1;
                    a1 = getRandomCoefficient(coefficientRange);
                    a2 = getRandomCoefficient(coefficientRange);
                    b2 = getRandomCoefficient(coefficientRange);
                }
            } else {
                // General case
                a1 = getRandomCoefficient(coefficientRange);
                b1 = getRandomCoefficient(coefficientRange);
                a2 = getRandomCoefficient(coefficientRange);
                b2 = getRandomCoefficient(coefficientRange);
            }

            // Calculate the constants based on the solution
            c1 = a1 * x + b1 * y;
            c2 = a2 * x + b2 * y;

            // Check for valid system (determinant != 0)
            const determinant = a1 * b2 - a2 * b1;

            if (determinant === 0) continue; // Skip parallel/same lines

            // If integer solutions only, verify solutions are integers
            if (integerSolutionsOnly) {
                const solX = (c1 * b2 - c2 * b1) / determinant;
                const solY = (a1 * c2 - a2 * c1) / determinant;
                if (!Number.isInteger(solX) || !Number.isInteger(solY)) continue;
            }

            break;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            console.warn('Could not generate valid system, using fallback');
            // Fallback to simple system
            x = 1; y = 1;
            a1 = 1; b1 = 1; c1 = 2;
            a2 = 1; b2 = -1; c2 = 0;
        }

        const equation1 = formatEquation(a1, b1, c1);
        const equation2 = formatEquation(a2, b2, c2);

        problems.push({
            type: currentSystemType,
            equation1,
            equation2,
            solution: { x, y }
        });

        // Use sum of absolute values of solutions for digital root
        digitalRoots.push({
            digitalRoot: digitalRoot(Math.abs(x) + Math.abs(y))
        });
    }

    return { problems, digitalRoots };
}