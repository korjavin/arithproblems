import assert from 'assert';
import { generateRationalOperationsData } from './generators/rational-operations.js';

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
    testProblemGeneration();
    testInputValidation();
    console.log('All rational operations tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}