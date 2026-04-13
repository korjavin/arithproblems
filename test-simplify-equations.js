import assert from 'assert';
import { generateSimplifyEquationsData, getCoefficients } from './generators/simplify-equations.js';

function testGetCoefficientsErrorPath() {
    console.log('--- Running tests for getCoefficients error path ---');

    // Create a mock node that does not match any known types and throws on evaluate
    const mockNode = {
        isOperatorNode: false,
        isSymbolNode: false,
        isConstantNode: false,
        isParenthesisNode: false,
        isUnaryMinus: false,
        evaluate: () => {
            throw new Error('Mock evaluation error');
        }
    };

    const [a, b] = getCoefficients(mockNode);
    assert.strictEqual(a, 0, 'Test Case Failed: getCoefficients should return a=0 on evaluation error');
    assert.strictEqual(b, 0, 'Test Case Failed: getCoefficients should return b=0 on evaluation error');

    // Also test a mock node that returns a non-number
    const mockNodeNonNumber = {
        evaluate: () => {
            return 'not a number';
        }
    };

    const [a2, b2] = getCoefficients(mockNodeNonNumber);
    assert.strictEqual(a2, 0, 'Test Case Failed: getCoefficients should return a=0 when evaluation is not a number');
    assert.strictEqual(b2, 0, 'Test Case Failed: getCoefficients should return b=0 when evaluation is not a number');

    // And test a mock node that works
    const mockNodeWorks = {
        evaluate: () => {
            return 42;
        }
    };

    const [a3, b3] = getCoefficients(mockNodeWorks);
    assert.strictEqual(a3, 0, 'Test Case Failed: getCoefficients should return a=0 when evaluation is successful');
    assert.strictEqual(b3, 42, 'Test Case Failed: getCoefficients should return b=42 when evaluation is successful');

    console.log('Test Case Passed: getCoefficients gracefully handles unsupported nodes and evaluation errors');
}

function testGenerateSimplifyEquationsData() {
    console.log('--- Running tests for generateSimplifyEquationsData ---');

    // Test case 1: Basic functionality - no brackets, small coefficient range
    let params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 5 };
    let result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 1 Failed: Should generate 5 problems');
    assert.strictEqual(result.controlSums.length, 5, 'Test Case 1 Failed: Should generate 5 control sums');
    console.log('Test Case 1 Passed: Basic functionality with no brackets');

    // Test case 2: With brackets enabled
    params = { numOperations: 3, includeBrackets: true, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 10 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 10, 'Test Case 2 Failed: Should generate 10 problems');
    assert.strictEqual(result.controlSums.length, 10, 'Test Case 2 Failed: Should generate 10 control sums');
    console.log('Test Case 2 Passed: With brackets enabled');

    // Test case 3: Check problem structure
    params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 1 };
    result = generateSimplifyEquationsData(params);
    const problem = result.problems[0];
    assert.strictEqual(typeof problem.expression, 'string', 'Test Case 3 Failed: Expression should be a string');
    assert(problem.expression.length > 0, 'Test Case 3 Failed: Expression should not be empty');
    console.log('Test Case 3 Passed: Problem structure');

    // Test case 4: Check control sum structure
    const controlSum = result.controlSums[0];
    assert.strictEqual(typeof controlSum.controlSum, 'number', 'Test Case 4 Failed: Control sum should be a number');
    assert(controlSum.controlSum >= 0 && controlSum.controlSum <= 9, 'Test Case 4 Failed: Control sum should be a single digit');
    console.log('Test Case 4 Passed: Control sum structure');

    // Test case 5: No brackets - expressions should not contain parentheses from brackets
    params = { numOperations: 4, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 20 };
    result = generateSimplifyEquationsData(params);
    for (const p of result.problems) {
        assert(!p.expression.includes('('), `Test Case 5 Failed: Expression "${p.expression}" should not contain brackets when includeBrackets is false`);
    }
    console.log('Test Case 5 Passed: No brackets when includeBrackets is false');

    // Test case 6: Higher bracket depth
    params = { numOperations: 3, includeBrackets: true, bracketDepth: 3, coefficientRange: 10, numberOfProblems: 10 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 10, 'Test Case 6 Failed: Should generate 10 problems');
    for (const p of result.problems) {
        assert(typeof p.expression === 'string' && p.expression.length > 0, 'Test Case 6 Failed: Expression should be a non-empty string');
    }
    console.log('Test Case 6 Passed: Higher bracket depth');

    // Test case 7: Large coefficient range
    params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 50, numberOfProblems: 5 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 7 Failed: Should generate 5 problems');
    console.log('Test Case 7 Passed: Large coefficient range');

    // Test case 8: Small coefficient range
    params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 5, numberOfProblems: 5 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 8 Failed: Should generate 5 problems');
    console.log('Test Case 8 Passed: Small coefficient range');

    // Test case 9: Many operations
    params = { numOperations: 6, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 5 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 9 Failed: Should generate 5 problems');
    console.log('Test Case 9 Passed: Many operations (6)');

    // Test case 10: Brackets with depth 2
    params = { numOperations: 3, includeBrackets: true, bracketDepth: 2, coefficientRange: 10, numberOfProblems: 10 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 10, 'Test Case 10 Failed: Should generate 10 problems');
    for (const cs of result.controlSums) {
        assert(typeof cs.controlSum === 'number' && cs.controlSum >= 0 && cs.controlSum <= 9, 'Test Case 10 Failed: Control sum should be valid');
    }
    console.log('Test Case 10 Passed: Brackets with depth 2');

    console.log('--- All tests for generateSimplifyEquationsData passed ---');
}

try {
    testGetCoefficientsErrorPath();
    testGenerateSimplifyEquationsData();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
