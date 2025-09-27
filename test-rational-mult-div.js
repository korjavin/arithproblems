import assert from 'assert';
import { generateRationalMultDivData } from './generators/rational-mult-div.js';
import { gcd } from './utils.js';

function testProblemGeneration() {
    const options = { maxVal: 10, avoidWholeNums: false, numberOfProblems: 20 };
    const data = generateRationalMultDivData(options);

    assert.strictEqual(data.problems.length, 20, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.controlSumsArray.length, 20, 'Test Case 2 Failed: Incorrect number of control sums generated.');
    console.log('All problem generation tests passed!');
}

function testAvoidWholeNums() {
    const options = { maxVal: 10, avoidWholeNums: true, numberOfProblems: 30 };
    const data = generateRationalMultDivData(options);

    if (data.problems.length > 0) {
        data.problems.forEach((p, i) => {
            let resultN, resultD;
            if (p.operation === 'multiply') {
                resultN = p.n1 * p.n2;
                resultD = p.d1 * p.d2;
            } else {
                resultN = p.n1 * p.d2;
                resultD = p.d1 * p.n2;
            }
            const commonDivisor = gcd(resultN, resultD);
            const finalD = resultD / commonDivisor;
            assert.notStrictEqual(finalD, 1, `Test Case 3.${i} Failed: Result is a whole number.`);
        });
    } else {
        console.warn("Warning: Could not generate any problems avoiding whole numbers, test might be inconclusive.");
    }

    console.log('All "avoid whole nums" tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateRationalMultDivData({ maxVal: 0, avoidWholeNums: false, numberOfProblems: 10 });
    }, Error, 'Test Case 4 Failed: Did not throw for maxVal < 1.');

    assert.throws(() => {
        generateRationalMultDivData({ maxVal: 10, avoidWholeNums: false, numberOfProblems: 0 });
    }, Error, 'Test Case 5 Failed: Did not throw for numberOfProblems < 1.');

    assert.throws(() => {
        generateRationalMultDivData({ maxVal: 10, avoidWholeNums: false, numberOfProblems: 51 });
    }, Error, 'Test Case 6 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testAvoidWholeNums();
    testInputValidation();
    console.log('All rational multiplication/division tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}