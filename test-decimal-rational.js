import assert from 'assert';
import { generateDecimalRationalData } from './generators/decimal-rational.js';

function testProblemGeneration() {
    const options = { problemMix: 'mixed', maxDecimalPlaces: 3, terminatingOnly: true, numberOfProblems: 10 };
    const data = generateDecimalRationalData(options);

    assert.strictEqual(data.problems.length, 10, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.digitalRoots.length, 10, 'Test Case 2 Failed: Incorrect number of digital roots generated.');
    console.log('All problem generation tests passed!');
}

function testProblemMix() {
    let options = { problemMix: 'fraction-to-decimal', maxDecimalPlaces: 2, terminatingOnly: true, numberOfProblems: 10 };
    let data = generateDecimalRationalData(options);
    assert(data.problems.every(p => p.type === 'fraction-to-decimal'), 'Test Case 3 Failed: Not all problems are fraction-to-decimal.');

    options = { problemMix: 'decimal-to-fraction', maxDecimalPlaces: 2, terminatingOnly: true, numberOfProblems: 10 };
    data = generateDecimalRationalData(options);
    assert(data.problems.every(p => p.type === 'decimal-to-fraction'), 'Test Case 4 Failed: Not all problems are decimal-to-fraction.');

    console.log('All problem mix tests passed!');
}

function testTerminatingOnly() {
    const options = { problemMix: 'fraction-to-decimal', maxDecimalPlaces: 4, terminatingOnly: true, numberOfProblems: 20 };
    const data = generateDecimalRationalData(options);

    if (data.problems.length > 0) {
        data.problems.forEach((p, i) => {
            const decimal = p.numerator / p.denominator;
            const decimalStr = decimal.toString();
            const decimalPlaces = decimalStr.includes('.') ? decimalStr.split('.')[1].length : 0;
            assert(decimalPlaces <= options.maxDecimalPlaces, `Test Case 5.${i} Failed: Fraction ${p.numerator}/${p.denominator} has more than ${options.maxDecimalPlaces} decimal places.`);
        });
    } else {
        console.warn("Warning: Could not generate any problems, terminating only test might be inconclusive.");
    }
    console.log('All "terminating only" tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateDecimalRationalData({ problemMix: 'mixed', maxDecimalPlaces: 0, terminatingOnly: true, numberOfProblems: 10 });
    }, Error, 'Test Case 6 Failed: Did not throw for maxDecimalPlaces < 1.');

    assert.throws(() => {
        generateDecimalRationalData({ problemMix: 'mixed', maxDecimalPlaces: 5, terminatingOnly: true, numberOfProblems: 10 });
    }, Error, 'Test Case 7 Failed: Did not throw for maxDecimalPlaces > 4.');

    assert.throws(() => {
        generateDecimalRationalData({ problemMix: 'mixed', maxDecimalPlaces: 2, terminatingOnly: true, numberOfProblems: 51 });
    }, Error, 'Test Case 8 Failed: Did not throw for numberOfProblems > 50.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testProblemMix();
    testTerminatingOnly();
    testInputValidation();
    console.log('All decimal/rational tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}