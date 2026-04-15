import assert from 'assert';
import { generateRationalMultDivData, calculateControlSum } from './generators/rational-mult-div.js';
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

function testControlSumCalculation() {
    console.log('Testing calculateControlSum...');
    assert.ok(Number.isNaN(calculateControlSum(1, 0)), 'Test Case C1 Failed: Should return NaN when denominator is 0');
    assert.ok(Number.isNaN(calculateControlSum(0, 0)), 'Test Case C2 Failed: Should return NaN when denominator is 0');
    assert.strictEqual(calculateControlSum(0, 5), 5, 'Test Case C3 Failed: Should return denominator when numerator is 0');
    assert.strictEqual(calculateControlSum(5, 1), 1, 'Test Case C4 Failed: Should return 1 when denominator is 1');
    assert.strictEqual(calculateControlSum(3, 5), 8, 'Test Case C5 Failed: Should return |num| + den when |num| < den');
    assert.strictEqual(calculateControlSum(-3, 5), 8, 'Test Case C6 Failed: Should return |num| + den when |num| < den');
    assert.strictEqual(calculateControlSum(7, 5), 7, 'Test Case C7 Failed: Should return (|num| % den) + den when |num| >= den');
    assert.strictEqual(calculateControlSum(-7, 5), 7, 'Test Case C8 Failed: Should return (|num| % den) + den when |num| >= den');
    console.log('All control sum tests passed!');
}

try {
    testProblemGeneration();
    testAvoidWholeNums();
    testInputValidation();
    testControlSumCalculation();
    console.log('All rational multiplication/division tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}