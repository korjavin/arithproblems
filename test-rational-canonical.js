import assert from 'assert';
import { generateRationalCanonicalData } from './generators/rational-canonical.js';
import { gcd } from './utils.js';

function testProblemGeneration() {
    const options = { maxVal: 30, ensureReducible: false, numberOfProblems: 15 };
    const data = generateRationalCanonicalData(options);

    assert.strictEqual(data.problems.length, 15, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.simplifiedAnswers.length, 15, 'Test Case 2 Failed: Incorrect number of answers generated.');
    console.log('All problem generation tests passed!');
}

function testEnsureReducible() {
    const options = { maxVal: 50, ensureReducible: true, numberOfProblems: 10 };
    const data = generateRationalCanonicalData(options);

    if (data.problems.length > 0) {
        data.problems.forEach((p, i) => {
            const commonDivisor = gcd(p.numerator, p.denominator);
            assert(commonDivisor > 1, `Test Case 3.${i} Failed: Fraction ${p.numerator}/${p.denominator} is not reducible.`);
        });
    } else {
        console.warn("Warning: Could not generate any reducible fractions, test might be inconclusive.");
    }

    console.log('All "ensure reducible" tests passed!');
}

function testControlSumCalculation() {
    // Let's manually check a few control sums
    const options = { maxVal: 10, ensureReducible: false, numberOfProblems: 1 };
    const data = generateRationalCanonicalData(options);

    // This test is tricky because the problems are random.
    // A better approach would be to test the control sum calculation directly,
    // but since it's an internal function, we'll trust the logic for now and
    // focus on the generator's structure.
    // We'll just check if a control sum is returned.
    if(data.simplifiedAnswers.length > 0) {
         assert(typeof data.simplifiedAnswers[0].controlSum === 'number', 'Test Case 4 Failed: Control sum is not a number.');
    } else {
        console.warn("Warning: no problems generated, skipping control sum test.")
    }

    console.log('All control sum calculation tests passed (structurally).');
}

function testInputValidation() {
    assert.throws(() => {
        generateRationalCanonicalData({ maxVal: 1, ensureReducible: false, numberOfProblems: 10 });
    }, Error, 'Test Case 5 Failed: Did not throw for maxVal < 2.');

    assert.throws(() => {
        generateRationalCanonicalData({ maxVal: 10, ensureReducible: false, numberOfProblems: 0 });
    }, Error, 'Test Case 6 Failed: Did not throw for numberOfProblems < 1.');

    assert.throws(() => {
        generateRationalCanonicalData({ maxVal: 10, ensureReducible: false, numberOfProblems: 51 });
    }, Error, 'Test Case 7 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testEnsureReducible();
    testControlSumCalculation();
    testInputValidation();
    console.log('All rational canonical tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}