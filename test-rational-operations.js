import assert from 'assert';
import { generateRationalOperationsData, calculateControlSum } from './generators/rational-operations.js';

function testCalculateControlSum() {
    // Edge case: denominator is 0
    assert.ok(Number.isNaN(calculateControlSum(1, 0)), 'Test Case C1 Failed: Should return NaN when denominator is 0');
    assert.ok(Number.isNaN(calculateControlSum(0, 0)), 'Test Case C2 Failed: Should return NaN when denominator is 0');

    // Edge case: numerator is 0
    assert.strictEqual(calculateControlSum(0, 5), 5, 'Test Case C3 Failed: Should return denominator when numerator is 0');

    // Edge case: denominator is 1
    assert.strictEqual(calculateControlSum(5, 1), 1, 'Test Case C4 Failed: Should return 1 when denominator is 1');

    // Case: |numerator| < denominator
    assert.strictEqual(calculateControlSum(3, 5), 8, 'Test Case C5 Failed: Should return |num| + den when |num| < den');
    assert.strictEqual(calculateControlSum(-3, 5), 8, 'Test Case C6 Failed: Should return |num| + den when |num| < den');

    // Case: |numerator| >= denominator
    assert.strictEqual(calculateControlSum(7, 5), 7, 'Test Case C7 Failed: Should return (|num| % den) + den when |num| >= den');
    assert.strictEqual(calculateControlSum(-7, 5), 7, 'Test Case C8 Failed: Should return (|num| % den) + den when |num| >= den');

    console.log('All control sum calculation tests passed!');
}

function testProblemGeneration() {
    const options = { numTerms: 3, maxVal: 10, numberOfProblems: 12 };
    const data = generateRationalOperationsData(options);

    assert.strictEqual(data.problems.length, 12, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.controlSumsArray.length, 12, 'Test Case 2 Failed: Incorrect number of control sums generated.');

    data.problems.forEach((p, i) => {
        assert.strictEqual(p.fractions.length, 3, `Test Case 3.${i} Failed: Incorrect number of fractions.`);
        assert.strictEqual(p.operations.length, 2, `Test Case 4.${i} Failed: Incorrect number of operations.`);
    });
    console.log('All problem generation tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateRationalOperationsData({ numTerms: 1, maxVal: 10, numberOfProblems: 10 });
    }, Error, 'Test Case 5 Failed: Did not throw for numTerms < 2.');

    assert.throws(() => {
        generateRationalOperationsData({ numTerms: 6, maxVal: 10, numberOfProblems: 10 });
    }, Error, 'Test Case 6 Failed: Did not throw for numTerms > 5.');

    assert.throws(() => {
        generateRationalOperationsData({ numTerms: 2, maxVal: 0, numberOfProblems: 10 });
    }, Error, 'Test Case 7 Failed: Did not throw for maxVal < 1.');

    assert.throws(() => {
        generateRationalOperationsData({ numTerms: 2, maxVal: 10, numberOfProblems: 51 });
    }, Error, 'Test Case 8 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testCalculateControlSum();
    testProblemGeneration();
    testInputValidation();
    console.log('All rational operations tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}