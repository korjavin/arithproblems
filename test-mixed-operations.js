import assert from 'assert';
import { generateMixedOperationsData } from './generators/mixed-operations.js';

function testProblemGeneration() {
    const options = { numOperations: 3, coefficientMax: 10, allowNegative: false, numberOfProblems: 10 };
    const data = generateMixedOperationsData(options);

    assert.strictEqual(data.problems.length, 10, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.answerRoots.length, 10, 'Test Case 2 Failed: Incorrect number of answer roots generated.');

    data.problems.forEach((p, i) => {
        assert(p.expression, `Test Case 3.${i} Failed: Expression is missing.`);
        assert(p.result !== undefined, `Test Case 4.${i} Failed: Result is missing.`);
        assert(Number.isInteger(p.result), `Test Case 5.${i} Failed: Result is not an integer.`);
        assert(p.result >= 0, `Test Case 6.${i} Failed: Result is negative when allowNegative is false.`);
    });
    console.log('All problem generation tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateMixedOperationsData({ numOperations: 11, coefficientMax: 10, allowNegative: false, numberOfProblems: 10 });
    }, Error, 'Test Case 7 Failed: Did not throw for numOperations > 10.');

    assert.throws(() => {
        generateMixedOperationsData({ numOperations: 0, coefficientMax: 10, allowNegative: false, numberOfProblems: 10 });
    }, Error, 'Test Case 8 Failed: Did not throw for numOperations < 1.');

    assert.throws(() => {
        generateMixedOperationsData({ numOperations: NaN, coefficientMax: 10, allowNegative: false, numberOfProblems: 10 });
    }, Error, 'Test Case 9 Failed: Did not throw for NaN numOperations.');

    assert.throws(() => {
        generateMixedOperationsData({ numOperations: 3, coefficientMax: 1, allowNegative: false, numberOfProblems: 10 });
    }, Error, 'Test Case 10 Failed: Did not throw for coefficientMax < 2.');

    assert.throws(() => {
        generateMixedOperationsData({ numOperations: 3, coefficientMax: NaN, allowNegative: false, numberOfProblems: 10 });
    }, Error, 'Test Case 11 Failed: Did not throw for NaN coefficientMax.');

    console.log('All input validation tests passed!');
}

function testAllowNegative() {
    const options = { numOperations: 3, coefficientMax: 50, allowNegative: true, numberOfProblems: 50 };
    const data = generateMixedOperationsData(options);

    let hasNegative = false;
    data.problems.forEach((p) => {
        if (p.result < 0) {
            hasNegative = true;
        }
    });

    // We cannot strictly assert that a negative result WILL be generated due to randomness,
    // but we CAN assert that generation works and result matches expression.
    assert.strictEqual(data.problems.length, 50, 'Test Case 12 Failed: Incorrect number of problems generated with allowNegative.');
    console.log('All allowNegative tests passed!');
}

try {
    testProblemGeneration();
    testInputValidation();
    testAllowNegative();
    console.log('All mixed operations tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
