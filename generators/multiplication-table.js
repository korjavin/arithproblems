import { getRandomInt, shuffleArray } from '../utils.js';

export function generateMultiplicationTableData({ fromFactor, toFactor, percentHints }) {
    if (isNaN(fromFactor) || fromFactor < 1) {
        fromFactor = 1;
    }
    if (isNaN(toFactor) || toFactor < fromFactor) {
        toFactor = fromFactor;
    }
    if (isNaN(percentHints) || percentHints < 0 || percentHints > 100) {
        percentHints = 5;
    }

    const headers = [];
    for (let i = fromFactor; i <= toFactor; i++) {
        headers.push(i);
    }

    const range = toFactor - fromFactor + 1;
    const totalCells = range * range;
    const cellsToFillCount = Math.floor(totalCells * (percentHints / 100));

    const allCellCoordinates = [];
    for (let r = fromFactor; r <= toFactor; r++) {
        for (let c = fromFactor; c <= toFactor; c++) {
            allCellCoordinates.push([r, c]);
        }
    }

    // Shuffle coordinates to pick random cells to pre-fill
    const shuffledCoordinates = shuffleArray(allCellCoordinates);

    const cellsToPreFill = new Set();
    for (let i = 0; i < cellsToFillCount && i < shuffledCoordinates.length; i++) {
        cellsToPreFill.add(`${shuffledCoordinates[i][0]}-${shuffledCoordinates[i][1]}`);
    }

    const rows = [];
    for (let i = fromFactor; i <= toFactor; i++) {
        const row = { header: i, cells: [] };
        for (let j = fromFactor; j <= toFactor; j++) {
            const isPrefilled = cellsToPreFill.has(`${i}-${j}`);
            row.cells.push({
                value: isPrefilled ? i * j : null,
                isPrefilled: isPrefilled,
            });
        }
        rows.push(row);
    }

    return { headers, rows };
}