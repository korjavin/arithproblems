import { planCells, PAGE_COLS, PAGE_ROWS, CELL_MM } from './ui/print-grid.js';

function assert(condition, message) {
    if (!condition) {
        console.error(`Assertion failed: ${message}`);
        process.exit(1);
    }
}

const shown = text => planCells(text).filter(b => b.cells > 0 || b.className.includes('gc-sep'));
const width = text => planCells(text).reduce((n, b) => n + b.cells, 0);

console.log('Running print grid tests...');

// Page geometry must be whole cells (keep in sync with styles/print-grid.css @page).
assert(PAGE_COLS * CELL_MM === 210 - 2 * 5, 'page width is a whole number of cells');
assert(PAGE_ROWS * CELL_MM === 297 - 2 * 6, 'page height is a whole number of cells');

// Math: one symbol per cell, spaces dropped.
const mixed = shown('8 × 2 − 4 + 10 = ');
assert(mixed.map(b => b.text).join('') === '8×2−4+10=', 'mixed expression keeps every symbol, drops spaces');
assert(mixed.every(b => b.className === 'gc' && b.cells === 1), 'every math symbol is one cell');
assert(width('8 × 2 − 4 + 10 = ') === 9, 'mixed expression is 9 cells wide');

// Every box is a whole number of cells.
for (const text of ['25% of 80 = ', 'Solve for x:', '0,37 = ', '2, 4, 6, ', 'Прямоугольник: длина = 5', '8xy', 'πr² =']) {
    planCells(text).forEach(b => assert(Number.isInteger(b.cells) && b.cells >= 0, `"${b.text}" in "${text}" is whole cells`));
    assert(planCells(text).map(b => b.text).join('') === text, `"${text}" keeps its text for the screen view`);
}

// Variables are cells, prose words are boxes.
assert(shown('8xy').every(b => b.className === 'gc'), '"xy" is two variables, not a word');
const words = shown('Solve for x:');
assert(words[0].className === 'gw' && words[0].text === 'Solve' && words[0].cells === 4, '"Solve" is a 4-cell word box');
assert(words[2].className === 'gc' && words[2].text === 'x', 'single letter is a cell');
assert(shown('длина').length === 1 && shown('длина')[0].className === 'gw', 'Cyrillic words are word boxes');

// Spaces after commas stay as empty cells.
assert(width('2, 4, 6') === 7, 'sequence "2, 4, 6" keeps a blank cell after each comma');

// Decimal separators sit on the cell line and take no width.
const dec = planCells('0.37');
assert(dec[1].className === 'gc gc-sep' && dec[1].cells === 0, 'decimal point takes no cell');
assert(width('0.37') === 3, '"0.37" is 3 cells wide');
assert(planCells('3, 4').find(b => b.text === ',').className === 'gc', 'list comma is not a decimal separator');

console.log('All print grid tests passed!');
