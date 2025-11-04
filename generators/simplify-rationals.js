import { gcd, digitalRoot } from '../utils.js';

/**
 * Generate problems for simplifying rational expressions
 * @param {Object} params - Generation parameters
 * @param {number} params.complexity - Complexity level (1-5)
 * @param {number} params.numberOfProblems - Number of problems to generate
 * @returns {Object} - { problems: Array, controlSums: Array }
 */
export function generateSimplifyRationalsData({ complexity, numberOfProblems }) {
    if (!complexity || complexity < 1 || complexity > 5) {
        throw new Error('Complexity must be between 1 and 5');
    }
    if (!numberOfProblems || numberOfProblems < 1) {
        throw new Error('Number of problems must be at least 1');
    }

    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        let problem;
        let controlSum;

        switch (complexity) {
            case 1:
                // Single fraction: Simple numeric coefficients ax/bx = a/b
                ({ problem, controlSum } = generateLevel1());
                break;
            case 2:
                // Single or two fractions: Multiple variables or simple operations
                ({ problem, controlSum } = generateLevel2());
                break;
            case 3:
                // Multiple fractions with operations, brackets in expressions
                ({ problem, controlSum } = generateLevel3());
                break;
            case 4:
                // Complex expressions: difference of squares, multiple operations
                ({ problem, controlSum } = generateLevel4());
                break;
            case 5:
                // Very complex: combinations of multiple complex fractions
                ({ problem, controlSum } = generateLevel5());
                break;
            default:
                throw new Error('Invalid complexity level');
        }

        problems.push(problem);
        controlSums.push({ controlSum });
    }

    return { problems, controlSums };
}

/**
 * Level 1: Single simple fraction with numeric coefficients
 * Example: 6x/9x = 2/3
 */
function generateLevel1() {
    const numeratorCoeff = randomInt(2, 12);
    const denominatorCoeff = randomInt(2, 12);
    const commonFactor = randomInt(2, 5);

    const num = numeratorCoeff * commonFactor;
    const den = denominatorCoeff * commonFactor;

    // Simplified form
    const simplifiedNum = numeratorCoeff;
    const simplifiedDen = denominatorCoeff;

    const numerator = `${num}x`;
    const denominator = `${den}x`;

    const controlSum = digitalRoot(simplifiedNum + simplifiedDen);

    return {
        problem: {
            type: 'single',
            numerator,
            denominator
        },
        controlSum
    };
}

/**
 * Level 2: Single fraction with variables OR two simple fractions to add/subtract
 * Examples:
 * - 12xy/8x = 3y/2
 * - 2x/3 + 4x/6 = 2x
 */
function generateLevel2() {
    if (Math.random() > 0.4) {
        // Multiple variables in a single fraction
        const numeratorCoeff = randomInt(2, 12);
        const denominatorCoeff = randomInt(2, 12);
        const commonFactor = randomInt(2, 4);

        const num = numeratorCoeff * commonFactor;
        const den = denominatorCoeff * commonFactor;

        const variables = ['xy', 'x²', 'xy'];
        const numeratorVar = variables[randomInt(0, 2)];

        let denominatorVar = 'x';

        const numerator = `${num}${numeratorVar}`;
        const denominator = `${den}${denominatorVar}`;

        const simplifiedNum = numeratorCoeff;
        const simplifiedDen = denominatorCoeff;
        const controlSum = digitalRoot(simplifiedNum + simplifiedDen);

        return {
            problem: {
                type: 'single',
                numerator,
                denominator
            },
            controlSum
        };
    } else {
        // Two fractions with addition
        const coeff1 = randomInt(1, 4);
        const coeff2 = randomInt(1, 4);
        const den1 = randomInt(2, 6);
        const den2 = den1 * randomInt(1, 2); // Related denominators

        const numerator1 = `${coeff1}x`;
        const denominator1 = `${den1}`;
        const numerator2 = `${coeff2}x`;
        const denominator2 = `${den2}`;
        const operation = '+';

        // For control sum, simplified result depends on the actual simplification
        // Simplified: (coeff1*den2 + coeff2*den1)x / (den1*den2), then reduce
        const simplifiedNumCoeff = coeff1 * den2 + coeff2 * den1;
        const simplifiedDenCoeff = den1 * den2;
        const g = gcd(simplifiedNumCoeff, simplifiedDenCoeff);
        const finalNum = simplifiedNumCoeff / g;
        const finalDen = simplifiedDenCoeff / g;

        const controlSum = digitalRoot(finalNum + finalDen);

        return {
            problem: {
                type: 'operation',
                fractions: [
                    { numerator: numerator1, denominator: denominator1 },
                    { numerator: numerator2, denominator: denominator2 }
                ],
                operations: [operation]
            },
            controlSum
        };
    }
}

/**
 * Level 3: Fractions with brackets in numerator/denominator, or multiple fraction operations
 * Examples:
 * - (6x + 12)/(3x + 6) = 2
 * - x²/x · 6/3x = 2/x
 */
function generateLevel3() {
    const variant = randomInt(0, 2);

    if (variant === 0) {
        // Fraction with brackets in both numerator and denominator
        const a = randomInt(2, 6);
        const b = randomInt(2, 8);
        const commonFactor = randomInt(2, 4);

        const num1 = a * commonFactor;
        const num2 = b * commonFactor;

        const numerator = `${num1}x + ${num2}`;
        const denominator = `${a}x + ${b}`;

        const controlSum = digitalRoot(commonFactor);

        return {
            problem: {
                type: 'single',
                numerator,
                denominator
            },
            controlSum
        };
    } else if (variant === 1) {
        // Two fractions with multiplication
        const num1 = randomInt(2, 8);
        const den1 = randomInt(2, 8);
        const num2 = randomInt(2, 8);
        const den2 = randomInt(2, 8);

        // Create fractions that will simplify nicely
        const numerator1 = `${num1}x`;
        const denominator1 = `${den1}`;
        const numerator2 = `${num2}`;
        const denominator2 = `${den2}x`;
        const operation = '·';

        // Simplified: (num1 * num2) / (den1 * den2)
        const simplifiedNumCoeff = num1 * num2;
        const simplifiedDenCoeff = den1 * den2;
        const g = gcd(simplifiedNumCoeff, simplifiedDenCoeff);
        const finalNum = simplifiedNumCoeff / g;
        const finalDen = simplifiedDenCoeff / g;

        const controlSum = digitalRoot(finalNum + finalDen);

        return {
            problem: {
                type: 'operation',
                fractions: [
                    { numerator: numerator1, denominator: denominator1 },
                    { numerator: numerator2, denominator: denominator2 }
                ],
                operations: [operation]
            },
            controlSum
        };
    } else {
        // Three fractions with operations
        const num1 = randomInt(1, 4);
        const num2 = randomInt(1, 4);
        const num3 = randomInt(1, 4);
        const den = randomInt(2, 5);

        const numerator1 = `${num1}x`;
        const denominator1 = `${den}`;
        const numerator2 = `${num2}x`;
        const denominator2 = `${den}`;
        const numerator3 = `${num3}x`;
        const denominator3 = `${den}`;

        const operation1 = '+';
        const operation2 = '-';

        // Simplified: (num1 + num2 - num3)x / den
        const simplifiedNumCoeff = num1 + num2 - num3;
        const simplifiedDenCoeff = den;
        const g = gcd(Math.abs(simplifiedNumCoeff), simplifiedDenCoeff);
        const finalNum = Math.abs(simplifiedNumCoeff / g);
        const finalDen = simplifiedDenCoeff / g;

        const controlSum = digitalRoot(finalNum + finalDen);

        return {
            problem: {
                type: 'operation',
                fractions: [
                    { numerator: numerator1, denominator: denominator1 },
                    { numerator: numerator2, denominator: denominator2 },
                    { numerator: numerator3, denominator: denominator3 }
                ],
                operations: [operation1, operation2]
            },
            controlSum
        };
    }
}

/**
 * Level 4: Difference of squares, complex brackets, division of fractions
 * Examples:
 * - (x² - 9)/(x + 3) = x - 3
 * - (2x + 4)/(x + 2) · (x - 1)/(2)
 */
function generateLevel4() {
    const variant = randomInt(0, 2);

    if (variant === 0) {
        // Difference of squares
        const a = randomInt(2, 7);
        const type = randomInt(0, 1);

        if (type === 0) {
            // (x² - a²)/(x + a) = x - a
            const numerator = `x² − ${a * a}`;
            const denominator = `x + ${a}`;
            const controlSum = digitalRoot(1 + a);

            return {
                problem: {
                    type: 'single',
                    numerator,
                    denominator
                },
                controlSum
            };
        } else {
            // (x² - a²)/(x - a) = x + a
            const numerator = `x² − ${a * a}`;
            const denominator = `x − ${a}`;
            const controlSum = digitalRoot(1 + a);

            return {
                problem: {
                    type: 'single',
                    numerator,
                    denominator
                },
                controlSum
            };
        }
    } else if (variant === 1) {
        // Factored trinomial: (x² + bx + c)/(x + d)
        const d = randomInt(2, 5);
        const e = randomInt(2, 5);
        const b = d + e;
        const c = d * e;

        const numerator = `x² + ${b}x + ${c}`;
        const denominator = `x + ${d}`;

        // Simplifies to x + e
        const controlSum = digitalRoot(1 + e);

        return {
            problem: {
                type: 'single',
                numerator,
                denominator
            },
            controlSum
        };
    } else {
        // Fraction with brackets in numerator
        const a = randomInt(2, 4);
        const b = randomInt(2, 5);
        const c = randomInt(1, 4);

        const numerator = `x + (${a}x − ${b})`;
        const denominator = `${c}`;

        // Simplifies to (1 + a)x - b / c
        const numCoeff = 1 + a;
        const g = gcd(numCoeff, c);
        const finalNum = numCoeff / g + b; // Approximate for control sum
        const finalDen = c / g;

        const controlSum = digitalRoot(finalNum + finalDen);

        return {
            problem: {
                type: 'single',
                numerator,
                denominator
            },
            controlSum
        };
    }
}

/**
 * Level 5: Very complex expressions with multiple operations and brackets
 * Examples:
 * - (2x² + 8x)/(x² - 16)
 * - (x + 1)/2 · 4/(x + 1) + x/3
 */
function generateLevel5() {
    const variant = randomInt(0, 2);

    if (variant === 0) {
        // Complex single fraction with factoring
        const a = randomInt(2, 5);
        const coeff = randomInt(2, 4);

        const numerator = `${coeff}x² + ${coeff * a}x`;
        const denominator = `x² − ${a * a}`;

        // Simplifies to coeff·x/(x - a)
        const controlSum = digitalRoot(coeff + a);

        return {
            problem: {
                type: 'single',
                numerator,
                denominator
            },
            controlSum
        };
    } else if (variant === 1) {
        // Multiplication and addition combined
        const a = randomInt(2, 4);
        const b = randomInt(2, 4);
        const c = randomInt(1, 3);

        const numerator1 = `${a}x`;
        const denominator1 = `${b}`;
        const numerator2 = `${b}`;
        const denominator2 = `${a}`;
        const numerator3 = `${c}x`;
        const denominator3 = `${a * b}`;

        const operation1 = '·';
        const operation2 = '+';

        // Simplified: x + cx/(a*b)
        const controlSum = digitalRoot(1 + c + a * b);

        return {
            problem: {
                type: 'operation',
                fractions: [
                    { numerator: numerator1, denominator: denominator1 },
                    { numerator: numerator2, denominator: denominator2 },
                    { numerator: numerator3, denominator: denominator3 }
                ],
                operations: [operation1, operation2]
            },
            controlSum
        };
    } else {
        // Fraction with nested brackets
        const a = randomInt(2, 4);
        const b = randomInt(2, 5);
        const c = randomInt(2, 4);
        const d = randomInt(1, 3);

        const numerator = `${a}x² + ${a * (b + c)}x + ${a * b * c}`;
        const denominator = `${d}x + ${d * b}`;

        // Simplifies to (a(x + c))/d
        const controlSum = digitalRoot(a + c + d);

        return {
            problem: {
                type: 'single',
                numerator,
                denominator
            },
            controlSum
        };
    }
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
