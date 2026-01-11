import { digitalRoot } from '../utils.js';

/**
 * Parse number range string to get min and max values
 */
function parseRange(rangeStr) {
    const [min, max] = rangeStr.split('-').map(Number);
    return { min, max };
}

/**
 * Get a random number within the specified range
 */
function getRandomInRange(rangeStr) {
    const { min, max } = parseRange(rangeStr);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random operation based on operation mix preference
 */
function getRandomOperation(operationMix, isHighPriority) {
    let operations;
    
    if (isHighPriority) {
        // High priority operations: × and ÷
        switch (operationMix) {
            case 'mult-add':
            case 'mult-sub':
                operations = ['×'];
                break;
            case 'div-add':
            case 'div-sub':
                operations = ['÷'];
                break;
            case 'all':
            default:
                operations = ['×', '÷'];
                break;
        }
    } else {
        // Low priority operations: + and -
        switch (operationMix) {
            case 'mult-add':
            case 'div-add':
                operations = ['+'];
                break;
            case 'mult-sub':
            case 'div-sub':
                operations = ['-'];
                break;
            case 'all':
            default:
                operations = ['+', '-'];
                break;
        }
    }
    
    return operations[Math.floor(Math.random() * operations.length)];
}

/**
 * Generate a 2-operation problem (pattern: a ± b ×÷ c)
 */
function generate2OpProblem(numberRange, operationMix, ensureEvenDivision) {
    const a = getRandomInRange(numberRange);
    let b = getRandomInRange(numberRange);
    let c = getRandomInRange(numberRange);
    
    const highPriorityOp = getRandomOperation(operationMix, true);
    const lowPriorityOp = getRandomOperation(operationMix, false);
    
    // Ensure c is not 0 for division
    if (highPriorityOp === '÷') {
        if (c === 0) c = 1;
        
        // If ensureEvenDivision, make b divisible by c
        if (ensureEvenDivision) {
            b = c * Math.floor(b / c);
            if (b === 0) b = c;
        }
    }
    
    // Calculate intermediate result (high priority operation first)
    let intermediate;
    if (highPriorityOp === '×') {
        intermediate = b * c;
    } else {
        intermediate = Math.floor(b / c);
    }
    
    // Calculate final result
    let result;
    if (lowPriorityOp === '+') {
        result = a + intermediate;
    } else {
        result = a - intermediate;
        // Ensure result is not negative
        if (result < 0) {
            result = intermediate - a;
            return {
                expression: `${intermediate} ${lowPriorityOp} ${a}`,
                numbers: [b, c, a],
                operations: [highPriorityOp, lowPriorityOp],
                intermediate: intermediate,
                result: result
            };
        }
    }
    
    return {
        expression: `${a} ${lowPriorityOp} ${b} ${highPriorityOp} ${c}`,
        numbers: [a, b, c],
        operations: [lowPriorityOp, highPriorityOp],
        intermediate: intermediate,
        result: result
    };
}

/**
 * Generate a 3-operation problem (pattern: a ×÷ b ± c ×÷ d)
 */
function generate3OpProblem(numberRange, operationMix, ensureEvenDivision) {
    let a = getRandomInRange(numberRange);
    let b = getRandomInRange(numberRange);
    let c = getRandomInRange(numberRange);
    let d = getRandomInRange(numberRange);
    
    const highPriorityOp1 = getRandomOperation(operationMix, true);
    const lowPriorityOp = getRandomOperation(operationMix, false);
    const highPriorityOp2 = getRandomOperation(operationMix, true);
    
    // Handle division by zero
    if (highPriorityOp1 === '÷') {
        if (b === 0) b = 1;
        if (ensureEvenDivision) {
            a = b * Math.floor(a / b);
            if (a === 0) a = b;
        }
    }
    
    if (highPriorityOp2 === '÷') {
        if (d === 0) d = 1;
        if (ensureEvenDivision) {
            c = d * Math.floor(c / d);
            if (c === 0) c = d;
        }
    }
    
    // Calculate first intermediate (a op1 b)
    let intermediate1;
    if (highPriorityOp1 === '×') {
        intermediate1 = a * b;
    } else {
        intermediate1 = Math.floor(a / b);
    }
    
    // Calculate second intermediate (c op2 d)
    let intermediate2;
    if (highPriorityOp2 === '×') {
        intermediate2 = c * d;
    } else {
        intermediate2 = Math.floor(c / d);
    }
    
    // Calculate final result
    let result;
    if (lowPriorityOp === '+') {
        result = intermediate1 + intermediate2;
    } else {
        result = intermediate1 - intermediate2;
        // Ensure result is not negative
        if (result < 0) {
            result = intermediate2 - intermediate1;
            return {
                expression: `${c} ${highPriorityOp2} ${d} ${lowPriorityOp} ${a} ${highPriorityOp1} ${b}`,
                numbers: [c, d, a, b],
                operations: [highPriorityOp2, lowPriorityOp, highPriorityOp1],
                intermediate1: intermediate2,
                intermediate2: intermediate1,
                result: result
            };
        }
    }
    
    return {
        expression: `${a} ${highPriorityOp1} ${b} ${lowPriorityOp} ${c} ${highPriorityOp2} ${d}`,
        numbers: [a, b, c, d],
        operations: [highPriorityOp1, lowPriorityOp, highPriorityOp2],
        intermediate1: intermediate1,
        intermediate2: intermediate2,
        result: result
    };
}

/**
 * Generate mixed operations problems
 */
export function generateMixedOperationsData({
    numberRange = '1-20',
    numOperations = 2,
    operationMix = 'all',
    ensureEvenDivision = true,
    numberOfProblems = 10
}) {
    // Validate inputs
    if (!['1-10', '1-20', '1-50', '1-100'].includes(numberRange)) {
        throw new Error('Invalid number range. Must be one of: 1-10, 1-20, 1-50, 1-100');
    }
    if (![2, 3].includes(numOperations)) {
        throw new Error('Invalid number of operations. Must be 2 or 3');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified (1-50).');
    }

    const problems = [];
    const answerRoots = [];

    for (let i = 0; i < numberOfProblems; i++) {
        let problem;
        
        if (numOperations === 2) {
            problem = generate2OpProblem(numberRange, operationMix, ensureEvenDivision);
        } else {
            problem = generate3OpProblem(numberRange, operationMix, ensureEvenDivision);
        }

        problems.push(problem);
        answerRoots.push({
            root: digitalRoot(problem.result)
        });
    }

    return { problems, answerRoots };
}
