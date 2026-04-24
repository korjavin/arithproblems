import { generateSimplifyRationalsData } from './generators/simplify-rationals.js';
import assert from 'assert';

function assertValidShape(result, expectedCount) {
    assert.strictEqual(result.problems.length, expectedCount, `Should generate ${expectedCount} problems`);
    assert.strictEqual(result.controlSums.length, expectedCount, `Should generate ${expectedCount} control sums`);
    assert(Array.isArray(result.problems), 'Problems should be an array');
    assert(Array.isArray(result.controlSums), 'Control sums should be an array');

    result.problems.forEach((problem, i) => {
        assert(problem.numerator, `Problem ${i} should have a numerator property`);
        assert(problem.denominator, `Problem ${i} should have a denominator property`);
        assert(typeof problem.numerator === 'string', `Problem ${i} numerator should be a string`);
        assert(typeof problem.denominator === 'string', `Problem ${i} denominator should be a string`);
    });

    result.controlSums.forEach((cs, i) => {
        assert(typeof cs.controlSum === 'number', `Control sum ${i} should be a number`);
        assert(cs.controlSum >= 0 && cs.controlSum <= 9, `Control sum ${i} should be between 0 and 9, got ${cs.controlSum}`);
    });
}

function testGenerateSimplifyRationalsData() {
    console.log('Testing generateSimplifyRationalsData...');

    // Defaults (monomials + binomials, coefficientRange 10)
    assertValidShape(generateSimplifyRationalsData({ numberOfProblems: 5 }), 5);

    // Each form alone
    const forms = [
        { includeMonomials: true, includeBinomials: false, includeQuadratics: false },
        { includeMonomials: false, includeBinomials: true, includeQuadratics: false },
        { includeMonomials: false, includeBinomials: false, includeQuadratics: true },
    ];
    for (const form of forms) {
        assertValidShape(
            generateSimplifyRationalsData({ ...form, coefficientRange: 10, numberOfProblems: 10 }),
            10,
        );
    }

    // All forms enabled
    assertValidShape(
        generateSimplifyRationalsData({
            includeMonomials: true,
            includeBinomials: true,
            includeQuadratics: true,
            coefficientRange: 20,
            numberOfProblems: 30,
        }),
        30,
    );

    // Coefficient range extremes
    assertValidShape(
        generateSimplifyRationalsData({ coefficientRange: 5, numberOfProblems: 15 }),
        15,
    );
    assertValidShape(
        generateSimplifyRationalsData({
            includeMonomials: true,
            includeBinomials: true,
            includeQuadratics: true,
            coefficientRange: 50,
            numberOfProblems: 15,
        }),
        15,
    );

    // Edge cases
    assertValidShape(generateSimplifyRationalsData({ numberOfProblems: 1 }), 1);
    assertValidShape(
        generateSimplifyRationalsData({
            includeMonomials: true,
            includeBinomials: true,
            includeQuadratics: true,
            coefficientRange: 10,
            numberOfProblems: 50,
        }),
        50,
    );

    // Invalid: no form enabled
    assert.throws(
        () => generateSimplifyRationalsData({
            includeMonomials: false,
            includeBinomials: false,
            includeQuadratics: false,
            numberOfProblems: 5,
        }),
        /At least one problem form/,
        'Should throw when no form is enabled',
    );

    // Invalid: coefficient range out of bounds
    assert.throws(
        () => generateSimplifyRationalsData({ coefficientRange: 4, numberOfProblems: 5 }),
        /Coefficient range/,
        'Should throw for coefficientRange < 5',
    );
    assert.throws(
        () => generateSimplifyRationalsData({ coefficientRange: 51, numberOfProblems: 5 }),
        /Coefficient range/,
        'Should throw for coefficientRange > 50',
    );

    // Invalid: numberOfProblems
    assert.throws(
        () => generateSimplifyRationalsData({ numberOfProblems: 0 }),
        /Number of problems/,
        'Should throw for numberOfProblems < 1',
    );

    console.log('✓ All generateSimplifyRationalsData tests passed');
}

testGenerateSimplifyRationalsData();
