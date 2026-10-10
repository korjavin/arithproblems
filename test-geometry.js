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

// Olympiad "inverse" types: recompute each answer from the problem fields and match the control sum.
function testInverseTypes() {
    const dr = n => (n === 0 ? 0 : 1 + ((n - 1) % 9));
    const solve = {
        'side-from-perimeter': p => {
            assert(p.perimeter >= 8 && p.perimeter <= 200);
            if (p.type === 'squares') { assert.strictEqual(p.perimeter % 4, 0); return p.perimeter / 4; }
            assert.strictEqual(p.type, 'rectangles');
            const b = p.perimeter / 2 - p.knownSide;
            assert(b >= 2, 'other side must be positive');
            return b;
        },
        'max-area': p => {
            assert(p.perimeter % 2 === 0 && p.perimeter >= 20 && p.perimeter <= 400);
            let best = 0;
            for (let a = 1; a < p.perimeter / 2; a++) best = Math.max(best, a * (p.perimeter / 2 - a));
            return best;
        },
        'ribbon': p => {
            [p.length, p.width, p.height].forEach(x => assert(x >= 10 && x <= 80));
            assert(p.bow >= 20 && p.bow <= 100);
            return 2 * p.length + 2 * p.width + 4 * p.height + p.bow;
        },
        'path-around': p => {
            assert(p.distance === 1 || p.distance === 2);
            return 2 * (p.length + 2 * p.distance) + 2 * (p.width + 2 * p.distance);
        },
        'floor-plan': p => {
            assert(p.rooms.length >= 2 && p.rooms.length <= 3);
            const areas = p.rooms.map(r => r.length * r.width);
            if (p.variant === 'largest') {
                const max = Math.max(...areas);
                assert.strictEqual(areas.filter(a => a === max).length, 1, 'largest room must be unique');
                return areas.indexOf(max) + 1;
            }
            assert.strictEqual(p.variant, 'rent');
            return p.price * areas.reduce((s, a) => s + a, 0);
        },
    };
    for (const [calculationType, fn] of Object.entries(solve)) {
        for (const shapeMix of ['mixed', 'squares', 'rectangles', 'circles']) {
            const data = generateGeometryData({ shapeMix, calculationType, maxDimension: 10, wholeNumbersOnly: false, numberOfProblems: 50 });
            data.problems.forEach((p, i) => {
                assert.strictEqual(p.calculation, calculationType);
                assert.notStrictEqual(p.type, 'circles', 'circles are excluded from the new types');
                const answer = fn(p);
                assert(Number.isInteger(answer) && answer > 0, `${calculationType}: answer ${answer} must be a positive integer`);
                const c = data.digitalRoots[i].digitalRoot;
                assert(c >= 0 && c <= 9);
                assert.strictEqual(c, dr(answer), `${calculationType}: control sum mismatch`);
            });
            if (calculationType === 'side-from-perimeter' && shapeMix !== 'mixed' && shapeMix !== 'circles') {
                assert(data.problems.every(p => p.type === shapeMix));
            }
        }
    }
    const variants = new Set(generateGeometryData({ shapeMix: 'mixed', calculationType: 'floor-plan', maxDimension: 10, wholeNumbersOnly: true, numberOfProblems: 50 }).problems.map(p => p.variant));
    assert.strictEqual(variants.size, 2, 'floor-plan should produce both variants');
    console.log('All inverse perimeter type tests passed!');
}

try {
    testInverseTypes();
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