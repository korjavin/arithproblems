import { digitalRoot } from '../utils.js';
import { create, all } from 'mathjs';

const math = create(all);

// Function to generate a random integer within a given range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a random operator
function getRandomOperator() {
    const operators = ['+', '-']; // Stick to + and - for simplicity for now
    return operators[getRandomInt(0, operators.length - 1)];
}

// Function to generate a simple term
function generateTerm(complexity) {
    if (Math.random() < 0.5) {
        return getRandomInt(1, 10 * complexity);
    } else {
        const coeff = getRandomInt(1, 5 * complexity);
        return `${coeff}*x`;
    }
}

// Function to generate a more complex expression, potentially with brackets
function generateExpression(complexity, depth = 0) {
    const numTerms = getRandomInt(2, 2 + complexity);
    let expression = '';

    for (let i = 0; i < numTerms; i++) {
        let term;
        if (depth < complexity && Math.random() < 0.4) {
            // Add a multiplier to the bracket
            const multiplier = getRandomInt(2, 5);
            term = `${multiplier}*(${generateExpression(complexity, depth + 1)})`;
        } else {
            term = generateTerm(complexity);
        }

        if (i > 0) {
            expression += ` ${getRandomOperator()} ${term}`;
        } else {
            expression = term;
        }
    }
    return expression;
}

// Helper function to extract coefficients 'a' and 'b' from 'ax + b'
function getCoefficients(node) {
    let a = 0;
    let b = 0;

    if (node.isOperatorNode && node.op === '+') {
        const [leftA, leftB] = getCoefficients(node.args[0]);
        const [rightA, rightB] = getCoefficients(node.args[1]);
        a = leftA + rightA;
        b = leftB + rightB;
    } else if (node.isOperatorNode && node.op === '-') {
        const [leftA, leftB] = getCoefficients(node.args[0]);
        const [rightA, rightB] = getCoefficients(node.args[1]);
        a = leftA - rightA;
        b = leftB - rightB;
    } else if (node.isOperatorNode && node.op === '*' && node.args[1].isSymbolNode && node.args[1].name === 'x') {
        a = node.args[0].value || 1; // Coefficient
    } else if (node.isSymbolNode && node.name === 'x') {
        a = 1;
    } else if (node.isConstantNode) {
        b = node.value;
    } else {
         // Fallback for more complex nodes if needed
        try {
            const evaluated = node.evaluate();
            if (typeof evaluated === 'number') {
                b = evaluated;
            }
        } catch (e) {
            // ignore
        }
    }
    return [a, b];
}


export function generateSimplifyEquationsData({ complexity, numberOfProblems }) {
    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        let expression;
        let simplified;
        let node;
        let a=0, b=0;

        // Try to generate a valid expression
        try {
            expression = generateExpression(complexity);
            simplified = math.simplify(expression);
            node = math.parse(simplified.toString());
            [a, b] = getCoefficients(node);
        } catch (e) {
            // If something fails, just try again with a simple one
            expression = '2*x + 3*x + 5';
            simplified = math.simplify(expression);
            node = math.parse(simplified.toString());
            [a, b] = getCoefficients(node);
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
