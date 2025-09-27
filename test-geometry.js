import assert from 'assert';
import { generateGeometryData } from './generators/geometry.js';

function testProblemGeneration() {
    const options = { shapeMix: 'mixed', calculationType: 'mixed', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 20 };
    const data = generateGeometryData(options);

    assert.strictEqual(data.problems.length, 20, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.digitalRoots.length, 20, 'Test Case 2 Failed: Incorrect number of digital roots generated.');
    console.log('All problem generation tests passed!');
}

function testShapeMix() {
    let options = { shapeMix: 'rectangles', calculationType: 'mixed', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 10 };
    let data = generateGeometryData(options);
    assert(data.problems.every(p => p.type === 'rectangles'), 'Test Case 3 Failed: Not all problems are rectangles.');

    options = { shapeMix: 'circles', calculationType: 'mixed', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 10 };
    data = generateGeometryData(options);
    assert(data.problems.every(p => p.type === 'circles'), 'Test Case 4 Failed: Not all problems are circles.');

    console.log('All shape mix tests passed!');
}

function testCalculationType() {
    let options = { shapeMix: 'mixed', calculationType: 'area', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 10 };
    let data = generateGeometryData(options);
    assert(data.problems.every(p => p.calculation === 'area'), 'Test Case 5 Failed: Not all calculations are area.');

    options = { shapeMix: 'mixed', calculationType: 'perimeter', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 10 };
    data = generateGeometryData(options);
    assert(data.problems.every(p => p.calculation === 'perimeter'), 'Test Case 6 Failed: Not all calculations are perimeter.');

    console.log('All calculation type tests passed!');
}

function testWholeNumbersOnly() {
    // Test with whole numbers only
    let options = { shapeMix: 'rectangles', calculationType: 'area', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 10 };
    let data = generateGeometryData(options);
    data.problems.forEach((p, i) => {
        assert.strictEqual(Math.floor(p.length), p.length, `Test Case 7.${i} Failed: Length should be a whole number.`);
        assert.strictEqual(Math.floor(p.width), p.width, `Test Case 8.${i} Failed: Width should be a whole number.`);
    });

    // Test with decimals allowed
    options = { shapeMix: 'rectangles', calculationType: 'area', maxDimension: 10, wholeNumbersOnly: false, numberOfProblems: 50 };
    data = generateGeometryData(options);
    const hasDecimal = data.problems.some(p => Math.floor(p.length) !== p.length || Math.floor(p.width) !== p.width);
    assert(hasDecimal, 'Test Case 9 Failed: No decimal dimensions were generated when allowed.');

    console.log('All "whole numbers only" tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateGeometryData({ shapeMix: 'mixed', calculationType: 'mixed', maxDimension: 1, wholeNumbersOnly: true, numberOfProblems: 10 });
    }, Error, 'Test Case 10 Failed: Did not throw for maxDimension < 2.');

    assert.throws(() => {
        generateGeometryData({ shapeMix: 'mixed', calculationType: 'mixed', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 0 });
    }, Error, 'Test Case 11 Failed: Did not throw for numberOfProblems < 1.');

    assert.throws(() => {
        generateGeometryData({ shapeMix: 'mixed', calculationType: 'mixed', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 51 });
    }, Error, 'Test Case 12 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testShapeMix();
    testCalculationType();
    testWholeNumbersOnly();
    testInputValidation();
    console.log('All geometry tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}