import assert from 'assert';
import { generateMultiplicationTableData } from './generators/multiplication-table.js';

function testTableDimensions() {
    const fromFactor = 1;
    const toFactor = 10;
    const data = generateMultiplicationTableData({ fromFactor, toFactor, percentHints: 50 });

    assert.strictEqual(data.headers.length, 10, 'Test Case 1 Failed: Incorrect number of headers.');
    assert.strictEqual(data.rows.length, 10, 'Test Case 2 Failed: Incorrect number of rows.');
    data.rows.forEach(row => {
        assert.strictEqual(row.cells.length, 10, 'Test Case 3 Failed: Incorrect number of cells in a row.');
    });
    console.log('All table dimension tests passed!');
}

function testHintPercentage() {
    const fromFactor = 1;
    const toFactor = 10;
    const percentHints = 30;
    const data = generateMultiplicationTableData({ fromFactor, toFactor, percentHints });

    const totalCells = 10 * 10;
    const expectedHints = Math.floor(totalCells * (percentHints / 100));

    let actualHints = 0;
    data.rows.forEach(row => {
        row.cells.forEach(cell => {
            if (cell.isPrefilled) {
                actualHints++;
            }
        });
    });

    assert.strictEqual(actualHints, expectedHints, `Test Case 4 Failed: Expected ${expectedHints} hints, but got ${actualHints}.`);
    console.log('All hint percentage tests passed!');
}

function testInvalidInputs() {
    // Test with NaN inputs
    let data = generateMultiplicationTableData({ fromFactor: NaN, toFactor: 10, percentHints: 10 });
    assert.strictEqual(data.headers.length, 10, 'Test Case 5 Failed: Handles NaN fromFactor.');

    data = generateMultiplicationTableData({ fromFactor: 1, toFactor: NaN, percentHints: 10 });
    assert.strictEqual(data.rows.length, 1, 'Test Case 6 Failed: Handles NaN toFactor.');

    // Test with toFactor < fromFactor
    data = generateMultiplicationTableData({ fromFactor: 10, toFactor: 5, percentHints: 10 });
    assert.strictEqual(data.headers.length, 1, 'Test Case 7 Failed: Handles toFactor < fromFactor.');
    assert.strictEqual(data.headers[0], 10, 'Test Case 8 Failed: Correct header for toFactor < fromFactor.');

    console.log('All invalid input tests passed!');
}

try {
    testTableDimensions();
    testHintPercentage();
    testInvalidInputs();
    console.log('All multiplication table tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}