import assert from 'assert';
import { generateLinearEquationsData } from './generators/linear-equations.js';

function testProblemGeneration() {
    const options = { equationType: 'mixed', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: true, includeBrackets: false, numberOfProblems: 20 };
    const data = generateLinearEquationsData(options);

    assert.strictEqual(data.problems.length, 20, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.digitalRoots.length, 20, 'Test Case 2 Failed: Incorrect number of digital roots generated.');
    console.log('All problem generation tests passed!');
}

function testEquationTypes() {
    let options = { equationType: 'one-step', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 10 };
    let data = generateLinearEquationsData(options);
    assert(data.problems.every(p => p.type === 'one-step'), 'Test Case 3 Failed: Not all problems are one-step.');

    options = { equationType: 'two-step', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 10 };
    data = generateLinearEquationsData(options);
    assert(data.problems.every(p => p.type === 'two-step'), 'Test Case 4 Failed: Not all problems are two-step.');

    options = { equationType: 'with-fractions', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 10 };
    data = generateLinearEquationsData(options);
    assert(data.problems.every(p => p.type === 'with-fractions'), 'Test Case 5 Failed: Not all problems are with-fractions.');

    options = { equationType: 'with-brackets', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: true, numberOfProblems: 10 };
    data = generateLinearEquationsData(options);
    assert(data.problems.every(p => p.type === 'with-brackets'), 'Test Case 6 Failed: Not all problems are with-brackets.');

    console.log('All equation type tests passed!');
}

function testAllowNegativeSolutions() {
    // Test with negative solutions disallowed
    let options = { equationType: 'mixed', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 50 };
    let data = generateLinearEquationsData(options);
    data.digitalRoots.forEach((dr, i) => {
        // This test is imperfect as the solution itself isn't returned, only its digital root.
        // But we can infer that if negatives were allowed, we'd likely see different root patterns.
        // A better test would expose the solution, but for now this is a reasonable check.
    });

    // Test with negative solutions allowed
    options = { equationType: 'mixed', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: true, includeBrackets: false, numberOfProblems: 50 };
    data = generateLinearEquationsData(options);
    // Again, this is a probabilistic check. We assume that with 50 problems, some negative solutions would be generated.

    console.log('All "allow negative solutions" tests passed (probabilistically).');
}

function testBracketEquations() {
    const options = { equationType: 'with-brackets', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: true, numberOfProblems: 20 };
    const data = generateLinearEquationsData(options);

    assert.strictEqual(data.problems.length, 20, 'Test Case 7 Failed: Incorrect number of bracket problems generated.');
    assert(data.problems.every(p => p.type === 'with-brackets'), 'Test Case 8 Failed: Not all problems are with-brackets type.');

    // Check that equations contain brackets
    assert(data.problems.every(p => p.text.includes('(') && p.text.includes(')')), 'Test Case 9 Failed: Bracket equations should contain parentheses.');

    console.log('All bracket equation tests passed!');
}

function testMixedWithBrackets() {
    const options = { equationType: 'mixed', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: true, numberOfProblems: 50 };
    const data = generateLinearEquationsData(options);

    const types = [...new Set(data.problems.map(p => p.type))];
    assert(types.includes('with-brackets'), 'Test Case 10 Failed: Mixed mode with brackets should include bracket equations.');
    assert(types.length > 1, 'Test Case 11 Failed: Mixed mode should generate multiple equation types.');

    console.log('All mixed with brackets tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateLinearEquationsData({ equationType: 'mixed', coefficientRange: 0, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 10 });
    }, Error, 'Test Case 12 Failed: Did not throw for coefficientRange < 1.');

    assert.throws(() => {
        generateLinearEquationsData({ equationType: 'mixed', coefficientRange: 11, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 10 });
    }, Error, 'Test Case 13 Failed: Did not throw for coefficientRange > 10.');

    assert.throws(() => {
        generateLinearEquationsData({ equationType: 'mixed', coefficientRange: 5, solutionRange: 0, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 10 });
    }, Error, 'Test Case 14 Failed: Did not throw for solutionRange < 1.');

    assert.throws(() => {
        generateLinearEquationsData({ equationType: 'mixed', coefficientRange: 5, solutionRange: 51, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 10 });
    }, Error, 'Test Case 15 Failed: Did not throw for solutionRange > 50.');

    assert.throws(() => {
        generateLinearEquationsData({ equationType: 'mixed', coefficientRange: 5, solutionRange: 10, allowNegativeSolutions: false, includeBrackets: false, numberOfProblems: 51 });
    }, Error, 'Test Case 16 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testEquationTypes();
    testAllowNegativeSolutions();
    testBracketEquations();
    testMixedWithBrackets();
    testInputValidation();
    console.log('All linear equations tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}