import { digitalRoot } from '../utils.js';
import { create, all } from 'mathjs';

const math = create(all);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to find factors of a number
function getFactors(num) {
    const factors = [];
    for (let i = 1; i <= Math.abs(num); i++) {
        if (num % i === 0) {
            factors.push(i);
        }
    }
    return factors;
}

export function generateMixedOperationsData({ numOperations, coefficientMax, allowNegative, numberOfProblems }) {
    if (isNaN(numOperations) || numOperations < 1 || numOperations > 10) {
        // Although UI says max 4, we can support more if needed, but 1-10 is safe validation
        throw new Error('Invalid number of operations.');
    }
    if (isNaN(coefficientMax) || coefficientMax < 2) {
        throw new Error('Invalid coefficient max.');
    }

    const problems = [];
    const answerRoots = [];
    const operators = ['+', '-', '*', '/'];

    let count = 0;
    let attempts = 0;
    const maxGlobalAttempts = numberOfProblems * 100;

    while (count < numberOfProblems && attempts < maxGlobalAttempts) {
        attempts++;

        // Generate operator sequence with no consecutive * or /
        const ops = [];
        for (let k = 0; k < numOperations; k++) {
            let op;
            if (k > 0 && (ops[k - 1] === '*' || ops[k - 1] === '/')) {
                // If previous was * or /, current must be + or -
                op = Math.random() < 0.5 ? '+' : '-';
            } else {
                op = operators[getRandomInt(0, 3)];
            }
            ops.push(op);
        }

        // Generate numbers
        // We will build the expression string and values simultaneously to satisfy division constraints
        // We need to identify chains of * and /
        const numbers = new Array(numOperations + 1).fill(null);

        // First pass: fulfill * and / chains
        // Identify groups of connected * / indices
        // e.g. indices [1, 2] means op[1] and op[2] are * or /
        // This connects numbers [1, 2, 3]

        let i = 0;
        while (i < ops.length) {
            if (ops[i] === '*' || ops[i] === '/') {
                // start of a chain
                let chainStart = i;
                let chainEnd = i;
                while (chainEnd + 1 < ops.length && (ops[chainEnd + 1] === '*' || ops[chainEnd + 1] === '/')) {
                    chainEnd++;
                }

                // Chain processes numbers from chainStart to chainEnd + 1
                // For the first number in chain, if it's not set, set it.
                if (numbers[chainStart] === null) {
                    numbers[chainStart] = getRandomInt(1, coefficientMax);
                }

                // Process the chain left to right
                let currentVal = numbers[chainStart];

                for (let k = chainStart; k <= chainEnd; k++) {
                    const op = ops[k];
                    let nextVal;

                    if (op === '*') {
                        nextVal = getRandomInt(1, coefficientMax);
                        currentVal *= nextVal;
                    } else { // op === '/'
                        // We need currentVal / nextVal to be integer
                        // Find factors of currentVal. 
                        // If currentVal is 0 (unlikely if inputs are >=1), avoid div by 0.
                        if (currentVal === 0) {
                            nextVal = getRandomInt(1, coefficientMax); // Just pick random, result 0
                        } else {
                            const factors = getFactors(currentVal);
                            // Avoid 1 if possible to make it non-trivial, unless 1 is the only factor
                            let validFactors = factors.filter(f => f <= coefficientMax);
                            if (validFactors.length === 0) validFactors = factors; // Fallback to any factor if none <= coefficientMax

                            if (validFactors.length > 1) {
                                // removing 1 if there are other options
                                const filtered = validFactors.filter(f => f !== 1);
                                if (filtered.length > 0) validFactors = filtered;
                            }

                            nextVal = validFactors[getRandomInt(0, validFactors.length - 1)];
                        }
                        currentVal /= nextVal;
                    }
                    numbers[k + 1] = nextVal;
                }

                // Continue search after this chain
                i = chainEnd + 1;
            } else {
                i++;
            }
        }

        // Second pass: fill remaining nulls (separated by + or -)
        for (let k = 0; k < numbers.length; k++) {
            if (numbers[k] === null) {
                numbers[k] = getRandomInt(1, coefficientMax);
            }
        }

        // Construct expression string
        let expression = numbers[0].toString();
        for (let k = 0; k < ops.length; k++) {
            let opSymbol = ops[k];
            if (opSymbol === '/') opSymbol = '÷';
            if (opSymbol === '*') opSymbol = '×';
            if (opSymbol === '-') opSymbol = '–'; // En dash

            expression += ` ${opSymbol} ${numbers[k + 1]}`;
        }

        // Evaluate for validation
        // Prepare string for mathjs (needs standard operators)
        let evalStr = numbers[0].toString();
        for (let k = 0; k < ops.length; k++) {
            evalStr += ` ${ops[k]} ${numbers[k + 1]}`;
        }

        let result;
        try {
            result = math.evaluate(evalStr);
        } catch (e) {
            continue; // Should not happen with our construction but safe to skip
        }

        // Check validation constraints
        if (!allowNegative && result < 0) {
            continue;
        }

        // Result should be integer by construction of division, but double check
        if (!Number.isInteger(result)) {
            continue;
        }

        problems.push({
            expression,
            result
        });

        answerRoots.push({
            root: digitalRoot(Math.abs(result)) // Use abs for digital root if negative allowed
        });

        count++;
    }

    if (count < numberOfProblems) {
        console.warn(`Could only generate ${count} mixed operations problems.`);
    }

    return { problems, answerRoots };
}
