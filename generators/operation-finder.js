/**
 * Operation Finder Generator
 * 
 * Creates problems where students must find the correct operations (+, -, ×, ÷)
 * to place between numbers to achieve a target result.
 * 
 * Example: 7 ○ 4 ○ 2 ○ 1 = 12
 * Solution: 7 + 4 × 2 - 1 = 12
 */

const OPERATIONS = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '×': (a, b) => a * b,
    '÷': (a, b) => Math.floor(a / b)
};

/**
 * Get a random number within the specified range
 */
function getRandomInRange(rangeStr) {
    const [min, max] = rangeStr.split('-').map(Number);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random operation from allowed operations
 */
function getRandomOperation(allowedOps) {
    return allowedOps[Math.floor(Math.random() * allowedOps.length)];
}

/**
 * Evaluate an expression with proper operator precedence
 * Numbers and operations are in separate arrays
 */
function evaluateExpression(numbers, operations) {
    // Create a copy to work with
    const nums = [...numbers];
    const ops = [...operations];

    // First pass: handle × and ÷ (high priority)
    let i = 0;
    while (i < ops.length) {
        if (ops[i] === '×' || ops[i] === '÷') {
            const result = OPERATIONS[ops[i]](nums[i], nums[i + 1]);
            nums.splice(i, 2, result);
            ops.splice(i, 1);
        } else {
            i++;
        }
    }

    // Second pass: handle + and - (low priority)
    i = 0;
    while (i < ops.length) {
        const result = OPERATIONS[ops[i]](nums[i], nums[i + 1]);
        nums.splice(i, 2, result);
        ops.splice(i, 1);
    }

    return nums[0];
}

/**
 * Build expression string for display
 */
function buildExpressionString(numbers, showCircles = true) {
    if (showCircles) {
        return numbers.join(' ○ ');
    } else {
        return numbers.join(' _ ');
    }
}

/**
 * Generate one operation finder problem
 */
function generateOneProblem(numberCount, numberRange, allowedOperations) {
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Generate random numbers
        const numbers = [];
        for (let i = 0; i < numberCount; i++) {
            numbers.push(getRandomInRange(numberRange));
        }

        // Generate random operations
        const operations = [];
        for (let i = 0; i < numberCount - 1; i++) {
            operations.push(getRandomOperation(allowedOperations));
        }

        // Calculate result
        const result = evaluateExpression(numbers, operations);

        // Validate result (should be positive and reasonable)
        if (result > 0 && result < 1000 && !isNaN(result) && isFinite(result)) {
            return {
                numbers,
                operations,
                result,
                expression: buildExpressionString(numbers, true)
            };
        }
    }

    // Fallback: simple addition if we couldn't find a valid problem
    const numbers = [];
    for (let i = 0; i < numberCount; i++) {
        numbers.push(getRandomInRange(numberRange));
    }
    const operations = new Array(numberCount - 1).fill('+');
    const result = numbers.reduce((sum, num) => sum + num, 0);

    return {
        numbers,
        operations,
        result,
        expression: buildExpressionString(numbers, true)
    };
}

/**
 * Generate operation finder problems
 * 
 * @param {Object} config - Configuration object
 * @param {number} config.numberCount - Number of numbers in each problem (3-5)
 * @param {string} config.numberRange - Range of numbers ('1-10', '1-20', '1-50')
 * @param {Array<string>} config.allowedOperations - Allowed operations (['+', '-', '×', '÷'])
 * @param {number} config.numberOfProblems - Number of problems to generate
 * @returns {Object} Generated problems data
 */
export function generateOperationFinderData({
    numberCount = 3,
    numberRange = '1-20',
    allowedOperations = ['+', '-', '×', '÷'],
    numberOfProblems = 10
}) {
    // Validate inputs
    if (numberCount < 3 || numberCount > 5) {
        throw new Error('Number count must be between 3 and 5');
    }

    if (!['1-10', '1-20', '1-50'].includes(numberRange)) {
        throw new Error('Invalid number range. Must be one of: 1-10, 1-20, 1-50');
    }

    if (!Array.isArray(allowedOperations) || allowedOperations.length === 0) {
        throw new Error('Allowed operations must be a non-empty array');
    }

    if (numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Number of problems must be between 1 and 50');
    }

    const problems = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const problem = generateOneProblem(numberCount, numberRange, allowedOperations);
        problems.push(problem);
    }

    return { problems };
}
