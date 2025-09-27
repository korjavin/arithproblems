import assert from 'assert';
import { generateProportionData } from './generators/proportion.js';
import { gcd } from './utils.js';

function testProblemGeneration() {
    const options = { maxBase: 10, maxMultiplier: 5, simplifyRatios: false, numberOfProblems: 15 };
    const data = generateProportionData(options);

    assert.strictEqual(data.problems.length, 15, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.digitalRoots.length, 15, 'Test Case 2 Failed: Incorrect number of digital roots generated.');

    data.problems.forEach((p, i) => {
        // Check if it's a valid proportion
        assert.strictEqual(p.a * p.d, p.b * p.c, `Test Case 3.${i} Failed: Invalid proportion ${p.a}/${p.b} = ${p.c}/${p.d}.`);
        // Check if one position is hidden
        assert(['a', 'b', 'c', 'd'].includes(p.hiddenPosition), `Test Case 4.${i} Failed: Invalid hidden position.`);
    });
    console.log('All problem generation tests passed!');
}

function testSimplifyRatios() {
    const options = { maxBase: 15, maxMultiplier: 8, simplifyRatios: true, numberOfProblems: 20 };
    const data = generateProportionData(options);

    if (data.problems.length > 0) {
        data.problems.forEach((p, i) => {
            const commonDivisor = gcd(p.a, p.b);
            assert.strictEqual(commonDivisor, 1, `Test Case 5.${i} Failed: Ratio ${p.a}/${p.b} is not simplified.`);
        });
    } else {
        console.warn("Warning: Could not generate any problems, simplify ratio test might be inconclusive.");
    }
    console.log('All "simplify ratios" tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateProportionData({ maxBase: 0, maxMultiplier: 5, simplifyRatios: false, numberOfProblems: 10 });
    }, Error, 'Test Case 6 Failed: Did not throw for maxBase < 1.');

    assert.throws(() => {
        generateProportionData({ maxBase: 16, maxMultiplier: 5, simplifyRatios: false, numberOfProblems: 10 });
    }, Error, 'Test Case 7 Failed: Did not throw for maxBase > 15.');

    assert.throws(() => {
        generateProportionData({ maxBase: 10, maxMultiplier: 1, simplifyRatios: false, numberOfProblems: 10 });
    }, Error, 'Test Case 8 Failed: Did not throw for maxMultiplier < 2.');

    assert.throws(() => {
        generateProportionData({ maxBase: 10, maxMultiplier: 13, simplifyRatios: false, numberOfProblems: 10 });
    }, Error, 'Test Case 9 Failed: Did not throw for maxMultiplier > 12.');

    assert.throws(() => {
        generateProportionData({ maxBase: 10, maxMultiplier: 5, simplifyRatios: false, numberOfProblems: 51 });
    }, Error, 'Test Case 10 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testSimplifyRatios();
    testInputValidation();
    console.log('All proportion tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}