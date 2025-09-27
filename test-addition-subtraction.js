import assert from 'assert';
import { generateAdditionSubtractionData } from './generators/addition-subtraction.js';

function testProblemGeneration() {
    const options = { digits1: 3, digits2: 2, numberOfProblems: 10 };
    const data = generateAdditionSubtractionData(options);

    assert.strictEqual(data.problems.length, 10, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.answerRoots.length, 10, 'Test Case 2 Failed: Incorrect number of answer roots generated.');

    data.problems.forEach((p, i) => {
        assert(p.num1.toString().length <= 3, `Test Case 3.${i} Failed: num1 has incorrect digits.`);
        assert(p.num2.toString().length <= 2, `Test Case 4.${i} Failed: num2 has incorrect digits.`);
        assert(p.operator === '+' || p.operator === '–', `Test Case 5.${i} Failed: Invalid operator.`);
    });
    console.log('All problem generation tests passed!');
}

function testInputValidation() {
    // Test for invalid number of digits
    assert.throws(() => {
        generateAdditionSubtractionData({ digits1: 8, digits2: 2, numberOfProblems: 10 });
    }, Error, 'Test Case 6 Failed: Did not throw for digits1 > 7.');

    assert.throws(() => {
        generateAdditionSubtractionData({ digits1: 0, digits2: 2, numberOfProblems: 10 });
    }, Error, 'Test Case 7 Failed: Did not throw for digits1 < 1.');

    // Test for invalid number of problems
    assert.throws(() => {
        generateAdditionSubtractionData({ digits1: 3, digits2: 2, numberOfProblems: 0 });
    }, Error, 'Test Case 8 Failed: Did not throw for numberOfProblems < 1.');

    assert.throws(() => {
        generateAdditionSubtractionData({ digits1: 3, digits2: 2, numberOfProblems: 51 });
    }, Error, 'Test Case 9 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testInputValidation();
    console.log('All addition/subtraction tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}