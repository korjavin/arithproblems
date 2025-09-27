import assert from 'assert';
import { generatePyramidProblemsData } from './generators/pyramid-problems.js';

function testProblemGeneration() {
    const options = { pyramidSize: 4, range: '1-10', missingType: 'random', numberOfProblems: 5 };
    const data = generatePyramidProblemsData(options);

    assert.strictEqual(data.problems.length, 5, 'Test Case 1 Failed: Incorrect number of problems generated.');
    data.problems.forEach((p, i) => {
        assert.strictEqual(p.pyramid.length, 4, `Test Case 2.${i} Failed: Incorrect pyramid height.`);
        assert.strictEqual(p.pyramid[0].length, 4, `Test Case 3.${i} Failed: Incorrect pyramid base width.`);
    });
    console.log('All problem generation tests passed!');
}

function testMissingTypes() {
    let options = { pyramidSize: 3, range: '1-10', missingType: 'top', numberOfProblems: 1 };
    let data = generatePyramidProblemsData(options);
    assert.strictEqual(data.problems[0].pyramid[2][0], '?', 'Test Case 4 Failed: Top was not hidden.');

    options = { pyramidSize: 5, range: '1-20', missingType: 'bottom', numberOfProblems: 1 };
    data = generatePyramidProblemsData(options);
    assert(data.problems[0].pyramid.slice(1).every(layer => layer.every(cell => cell === '?')), 'Test Case 5 Failed: Not all non-base numbers were hidden for missingType=bottom.');

    options = { pyramidSize: 4, range: '1-10', missingType: 'middle', numberOfProblems: 1 };
    data = generatePyramidProblemsData(options);
    const middleLayers = data.problems[0].pyramid.slice(1, -1);
    const hasMissingInMiddle = middleLayers.some(layer => layer.some(cell => cell === '?'));
    assert(hasMissingInMiddle, 'Test Case 6 Failed: No missing numbers in middle layers.');

    console.log('All missing type tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generatePyramidProblemsData({ pyramidSize: 2, range: '1-10', missingType: 'random', numberOfProblems: 5 });
    }, Error, 'Test Case 7 Failed: Did not throw for pyramidSize < 3.');

    assert.throws(() => {
        generatePyramidProblemsData({ pyramidSize: 6, range: '1-10', missingType: 'random', numberOfProblems: 5 });
    }, Error, 'Test Case 8 Failed: Did not throw for pyramidSize > 5.');

    assert.throws(() => {
        generatePyramidProblemsData({ pyramidSize: 3, range: 'invalid', missingType: 'random', numberOfProblems: 5 });
    }, Error, 'Test Case 9 Failed: Did not throw for invalid range.');

    assert.throws(() => {
        generatePyramidProblemsData({ pyramidSize: 3, range: '1-10', missingType: 'random', numberOfProblems: 21 });
    }, Error, 'Test Case 10 Failed: Did not throw for numberOfProblems > 20.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testMissingTypes();
    testInputValidation();
    console.log('All pyramid problems tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}