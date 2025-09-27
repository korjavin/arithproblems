import assert from 'assert';
import { generatePercentageData } from './generators/percentage.js';

function testProblemGeneration() {
    const options = { problemType: 'mixed', maxNumber: 100, wholePercentsOnly: true, numberOfProblems: 15 };
    const data = generatePercentageData(options);

    assert.strictEqual(data.problems.length, 15, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.digitalRoots.length, 15, 'Test Case 2 Failed: Incorrect number of digital roots generated.');
    console.log('All problem generation tests passed!');
}

function testProblemTypes() {
    let options = { problemType: 'find-percent', maxNumber: 100, wholePercentsOnly: true, numberOfProblems: 10 };
    let data = generatePercentageData(options);
    assert(data.problems.every(p => p.type === 'find-percent'), 'Test Case 3 Failed: Not all problems are find-percent.');

    options = { problemType: 'find-what-percent', maxNumber: 100, wholePercentsOnly: true, numberOfProblems: 10 };
    data = generatePercentageData(options);
    assert(data.problems.every(p => p.type === 'find-what-percent'), 'Test Case 4 Failed: Not all problems are find-what-percent.');

    options = { problemType: 'find-whole', maxNumber: 100, wholePercentsOnly: true, numberOfProblems: 10 };
    data = generatePercentageData(options);
    assert(data.problems.every(p => p.type === 'find-whole'), 'Test Case 5 Failed: Not all problems are find-whole.');

    console.log('All problem type tests passed!');
}

function testWholePercentsOnly() {
    // Test with whole percents only
    let options = { problemType: 'find-percent', maxNumber: 100, wholePercentsOnly: true, numberOfProblems: 20 };
    let data = generatePercentageData(options);
    data.problems.forEach((p, i) => {
        assert.strictEqual(Math.floor(p.percentage), p.percentage, `Test Case 6.${i} Failed: Percentage should be a whole number.`);
    });

    // Test with decimal percents allowed
    options = { problemType: 'find-percent', maxNumber: 100, wholePercentsOnly: false, numberOfProblems: 50 };
    data = generatePercentageData(options);
    const hasDecimal = data.problems.some(p => Math.floor(p.percentage) !== p.percentage);
    assert(hasDecimal, 'Test Case 7 Failed: No decimal percentages were generated when allowed.');

    console.log('All "whole percents only" tests passed!');
}


function testInputValidation() {
    assert.throws(() => {
        generatePercentageData({ problemType: 'mixed', maxNumber: 9, wholePercentsOnly: true, numberOfProblems: 10 });
    }, Error, 'Test Case 8 Failed: Did not throw for maxNumber < 10.');

    assert.throws(() => {
        generatePercentageData({ problemType: 'mixed', maxNumber: 100, wholePercentsOnly: true, numberOfProblems: 0 });
    }, Error, 'Test Case 9 Failed: Did not throw for numberOfProblems < 1.');

    assert.throws(() => {
        generatePercentageData({ problemType: 'mixed', maxNumber: 100, wholePercentsOnly: true, numberOfProblems: 51 });
    }, Error, 'Test Case 10 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testProblemTypes();
    testWholePercentsOnly();
    testInputValidation();
    console.log('All percentage tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}