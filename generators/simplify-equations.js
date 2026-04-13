import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';
import { create, all } from 'mathjs';

const math = create(all);

// Function to generate a random operator
function getRandomOperator() {
    const operators = ['+', '-']; // Stick to + and - for simplicity for now
    return getRandomFromArray(operators);
}

// Function to generate a simple term
function generateTerm(coefficientRange) {
    if (getRandomInt(0, 1) === 0) {
        return getRandomInt(1, coefficientRange);
    } else {
        const coeff = getRandomInt(1, Math.max(1, Math.floor(coefficientRange / 2)));
        return `${coeff}*x`;
    }
}

// Function to generate a more complex expression, potentially with brackets
function generateExpression(opts, depth = 0) {
    const { numOperations, includeBrackets, bracketDepth, coefficientRange } = opts;
    let expression = '';

    for (let i = 0; i < numOperations; i++) {
        let term;
        if (includeBrackets && depth < bracketDepth && getRandomInt(1, 100) <= 40) {
            // Add a multiplier to the bracket; use fewer terms inside to avoid exponential growth
            const multiplier = getRandomInt(2, 5);
            const innerOpts = { ...opts, numOperations: Math.max(2, Math.min(3, numOperations - 1)) };
            term = `${multiplier}*(${generateExpression(innerOpts, depth + 1)})`;
        } else {
            term = generateTerm(coefficientRange);
        }

        if (i > 0) {
            expression += ` ${getRandomOperator()} ${term}`;
        } else {
            expression = term;
        }
    }
    return expression;
}

export function generateSimplifyEquationsData({ numOperations, includeBrackets, bracketDepth, coefficientRange, numberOfProblems }) {
    if (isNaN(numOperations) || numOperations < 2 || numOperations > 6) {
        throw new Error('Invalid number of operations.');
    }
    if (isNaN(bracketDepth) || bracketDepth < 1 || bracketDepth > 3) {
        throw new Error('Invalid bracket depth.');
    }
    if (isNaN(coefficientRange) || coefficientRange < 5 || coefficientRange > 50) {
        throw new Error('Invalid coefficient range.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems.');
    }

    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        let expression;
        let simplified;
        let node;
        let a = 0, b = 0;

        // Try to generate a valid expression
        try {
            expression = generateExpression({ numOperations, includeBrackets, bracketDepth, coefficientRange });
            simplified = math.simplify(expression);
            node = math.parse(simplified.toString());

            // Extract coefficients by evaluating at x=0 and x=1
            // For ax + b: at x=0 we get b, at x=1 we get a+b
            b = node.evaluate({ x: 0 });
            const aPlusB = node.evaluate({ x: 1 });
            a = aPlusB - b;
        } catch (e) {
            // If something fails, just try again with a simple one
            expression = '2*x + 3*x + 5';
            simplified = math.simplify(expression);
            node = math.parse(simplified.toString());
            b = node.evaluate({ x: 0 });
            const aPlusB = node.evaluate({ x: 1 });
            a = aPlusB - b;
        }

        problems.push({
            expression: expression.replace(/\*/g, '⋅'), // Use dot for multiplication
        });

        // control sum is the digital root of the sum of absolute values of coefficients
        const controlSum = digitalRoot(Math.abs(a) + Math.abs(b));

        controlSums.push({
            controlSum: controlSum
        });
    }

    return { problems, controlSums };
}
