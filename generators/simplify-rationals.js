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
                // Simple numeric coefficients: ax/bx = a/b
                ({ problem, controlSum } = generateLevel1());
                break;
            case 2:
                // Numeric with multiple variables: axy/bx = ay/b
                ({ problem, controlSum } = generateLevel2());
                break;
            case 3:
                // Common factor in numerator and denominator: (ax + ay)/(bx + by)
                ({ problem, controlSum } = generateLevel3());
                break;
            case 4:
                // Difference of squares or simple trinomials
                ({ problem, controlSum } = generateLevel4());
                break;
            case 5:
                // More complex expressions with multiple factors
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
 * Level 1: Simple numeric coefficients
 * Example: 6x/9x = 2/3
 */
function generateLevel1() {
    const numeratorCoeff = randomInt(2, 20);
    const denominatorCoeff = randomInt(2, 20);
    const commonFactor = randomInt(2, 5);

    const num = numeratorCoeff * commonFactor;
    const den = denominatorCoeff * commonFactor;

    // Simplified form
    const simplifiedNum = numeratorCoeff;
    const simplifiedDen = denominatorCoeff;

    const expression = `\\frac{${num}x}{${den}x}`;
    const controlSum = digitalRoot(simplifiedNum + simplifiedDen);

    return {
        problem: { expression },
        controlSum
    };
}

/**
 * Level 2: Multiple variables with numeric coefficients
 * Example: 12xy/8x = 3y/2
 */
function generateLevel2() {
    const numeratorCoeff = randomInt(2, 15);
    const denominatorCoeff = randomInt(2, 15);
    const commonFactor = randomInt(2, 4);

    const num = numeratorCoeff * commonFactor;
    const den = denominatorCoeff * commonFactor;

    const variables = ['xy', 'x', 'xy²', 'x²y'];
    const numeratorVar = variables[randomInt(0, 1)]; // xy or x
    const hasCommonVar = Math.random() > 0.5;

    let denominatorVar;
    let simplifiedNumVar;

    if (numeratorVar === 'xy' && hasCommonVar) {
        denominatorVar = Math.random() > 0.5 ? 'x' : 'y';
        simplifiedNumVar = denominatorVar === 'x' ? 'y' : 'x';
    } else {
        denominatorVar = 'x';
        simplifiedNumVar = numeratorVar === 'xy' ? 'y' : '';
    }

    const expression = `\\frac{${num}${numeratorVar}}{${den}${denominatorVar}}`;

    // Simplified form coefficients
    const simplifiedNum = numeratorCoeff;
    const simplifiedDen = denominatorCoeff;

    const controlSum = digitalRoot(simplifiedNum + simplifiedDen);

    return {
        problem: { expression },
        controlSum
    };
}

/**
 * Level 3: Common factor in binomials
 * Example: (6x + 12)/(3x + 6) = 2
 */
function generateLevel3() {
    const a = randomInt(2, 8);
    const b = randomInt(2, 8);
    const commonFactor = randomInt(2, 5);

    const num1 = a * commonFactor;
    const num2 = b * commonFactor;
    const den1 = a;
    const den2 = b;

    const useX = Math.random() > 0.3;
    const xTerm = useX ? 'x' : '';

    // For variety, sometimes make it a simple ratio
    if (Math.random() > 0.5) {
        const expression = `\\frac{${num1}${xTerm} + ${num2}}{${den1}${xTerm} + ${den2}}`;
        const controlSum = digitalRoot(commonFactor); // Simplifies to commonFactor

        return {
            problem: { expression },
            controlSum
        };
    } else {
        // (ax + b)/(cx + d) where we can factor out from numerator
        const factorNum = randomInt(2, 4);
        const coeff1 = randomInt(2, 6);
        const coeff2 = randomInt(2, 6);

        const expression = `\\frac{${factorNum * coeff1}x + ${factorNum * coeff2}}{${coeff1}x + ${coeff2}}`;
        const controlSum = digitalRoot(factorNum); // Simplifies to factorNum

        return {
            problem: { expression },
            controlSum
        };
    }
}

/**
 * Level 4: Difference of squares or factored expressions
 * Example: (x² - 4)/(x + 2) = x - 2
 */
function generateLevel4() {
    const type = randomInt(0, 2);

    if (type === 0) {
        // Difference of squares: (x² - a²)/(x + a) = x - a
        const a = randomInt(2, 6);
        const expression = `\\frac{x² - ${a * a}}{x + ${a}}`;

        // Simplifies to x - a, control sum based on coefficient of x (1) and constant (-a)
        const controlSum = digitalRoot(1 + a);

        return {
            problem: { expression },
            controlSum
        };
    } else if (type === 1) {
        // Difference of squares: (x² - a²)/(x - a) = x + a
        const a = randomInt(2, 6);
        const expression = `\\frac{x² - ${a * a}}{x - ${a}}`;

        // Simplifies to x + a
        const controlSum = digitalRoot(1 + a);

        return {
            problem: { expression },
            controlSum
        };
    } else {
        // Factored trinomial: (x² + bx + c)/(x + d) where d divides the trinomial
        const d = randomInt(2, 5);
        const e = randomInt(2, 5);
        const b = d + e;
        const c = d * e;

        const expression = `\\frac{x² + ${b}x + ${c}}{x + ${d}}`;

        // Simplifies to x + e
        const controlSum = digitalRoot(1 + e);

        return {
            problem: { expression },
            controlSum
        };
    }
}

/**
 * Level 5: More complex expressions
 * Example: (2x² + 8x)/(x² - 16) = 2x/(x - 4)
 */
function generateLevel5() {
    const type = randomInt(0, 2);

    if (type === 0) {
        // (ax² + bax)/(x² - a²) = ax/(x - a)
        const a = randomInt(2, 5);
        const coeff = randomInt(2, 4);

        const expression = `\\frac{${coeff}x² + ${coeff * a}x}{x² - ${a * a}}`;

        // Simplifies to (coeff·x)/(x - a), control sum from coeff + a
        const controlSum = digitalRoot(coeff + a);

        return {
            problem: { expression },
            controlSum
        };
    } else if (type === 1) {
        // (x² - bx)/(x² - b²) = x/(x + b)
        const b = randomInt(2, 6);

        const expression = `\\frac{x² - ${b}x}{x² - ${b * b}}`;

        // Simplifies to x/(x + b), control sum from 1 + b
        const controlSum = digitalRoot(1 + b);

        return {
            problem: { expression },
            controlSum
        };
    } else {
        // (ax² + 2abx + ab²)/(ax + ab) = (x + b)
        const a = randomInt(2, 4);
        const b = randomInt(2, 5);

        const c1 = a;
        const c2 = 2 * a * b;
        const c3 = a * b * b;
        const d1 = a;
        const d2 = a * b;

        const expression = `\\frac{${c1}x² + ${c2}x + ${c3}}{${d1}x + ${d2}}`;

        // Simplifies to x + b
        const controlSum = digitalRoot(1 + b);

        return {
            problem: { expression },
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
