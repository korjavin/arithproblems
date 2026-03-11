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

    // Test case 1: Basic functionality
    let params = { complexity: 1, numberOfProblems: 5 };
    let result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 1 Failed: Should generate 5 problems');
    assert.strictEqual(result.controlSums.length, 5, 'Test Case 1 Failed: Should generate 5 control sums');
    console.log('Test Case 1 Passed: Basic functionality');

    // Test case 2: Higher complexity
    params = { complexity: 3, numberOfProblems: 10 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 10, 'Test Case 2 Failed: Should generate 10 problems');
    assert.strictEqual(result.controlSums.length, 10, 'Test Case 2 Failed: Should generate 10 control sums');
    console.log('Test Case 2 Passed: Higher complexity');

    // Test case 3: Check problem structure
    params = { complexity: 1, numberOfProblems: 1 };
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

    console.log('--- All tests for generateSimplifyEquationsData passed ---');
}

try {
    testGetCoefficientsErrorPath();
    testGenerateSimplifyEquationsData();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
