import assert from 'assert';
import { generateHouseProblemsData } from './generators/house-problems.js';

function testProblemGeneration() {
    const options = { range: '1-20', numberOfProblems: 10 };
    const data = generateHouseProblemsData(options);

    assert.strictEqual(data.problems.length, 10, 'Test Case 1 Failed: Incorrect number of problems generated.');

    data.problems.forEach((p, i) => {
        assert.strictEqual(p.num1 + p.num2, p.sum, `Test Case 2.${i} Failed: Sum is incorrect.`);
        assert(p.sum <= 20, `Test Case 3.${i} Failed: Sum exceeds the specified range.`);
        assert([0, 1, 2].includes(p.missingPosition), `Test Case 4.${i} Failed: Invalid missing position.`);
    });
    console.log('All problem generation tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateHouseProblemsData({ range: '1-10', numberOfProblems: 0 });
    }, Error, 'Test Case 5 Failed: Did not throw for numberOfProblems < 1.');

    assert.throws(() => {
        generateHouseProblemsData({ range: '1-10', numberOfProblems: 51 });
    }, Error, 'Test Case 6 Failed: Did not throw for numberOfProblems > 50.');

    assert.throws(() => {
        generateHouseProblemsData({ range: 'invalid-range', numberOfProblems: 10 });
    }, Error, 'Test Case 7 Failed: Did not throw for invalid range.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testInputValidation();
    console.log('All house problems tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}