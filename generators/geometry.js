import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

function getRandomDimension(maxDimension, wholeNumbersOnly) {
    if (wholeNumbersOnly) {
        return getRandomInt(2, maxDimension);
    }
    // 0.5 increments
    return Math.round((getRandomInt(0, (maxDimension - 2) * 2) / 2 + 2) * 2) / 2;
}

// Olympiad "inverse" perimeter types. Dimensions come from fixed ranges, not maxDimension; circles never appear.
const INVERSE_TYPES = ['side-from-perimeter', 'max-area', 'ribbon', 'path-around', 'floor-plan'];

function generateInverseProblem(calculation, shapeMix) {
    if (calculation === 'side-from-perimeter') {
        const type = shapeMix === 'squares' || shapeMix === 'rectangles' ? shapeMix : getRandomFromArray(['squares', 'rectangles']);
        if (type === 'squares') {
            const side = getRandomInt(2, 50); // P = 8..200
            return { problem: { type, calculation, perimeter: 4 * side }, answer: side };
        }
        const a = getRandomInt(2, 50), b = getRandomInt(2, 50);
        return { problem: { type, calculation, perimeter: 2 * (a + b), knownSide: a }, answer: b };
    }
    if (calculation === 'max-area') {
        const perimeter = 2 * getRandomInt(10, 200); // even, 20..400
        const half = perimeter / 2;
        return { problem: { type: 'rectangles', calculation, perimeter }, answer: Math.floor(half / 2) * Math.ceil(half / 2) };
    }
    if (calculation === 'ribbon') {
        const length = getRandomInt(10, 80), width = getRandomInt(10, 80), height = getRandomInt(10, 80), bow = getRandomInt(20, 100);
        return { problem: { type: 'box', calculation, length, width, height, bow }, answer: 2 * length + 2 * width + 4 * height + bow };
    }
    if (calculation === 'path-around') {
        const length = getRandomInt(10, 60), width = getRandomInt(5, 40), distance = getRandomInt(1, 2);
        return { problem: { type: 'rectangles', calculation, length, width, distance }, answer: 2 * (length + 2 * distance) + 2 * (width + 2 * distance) };
    }
    // floor-plan: 2-3 rooms; 'largest' asks the room number (unique max area), 'rent' asks area x price for the whole flat
    const variant = getRandomFromArray(['largest', 'rent']);
    const count = getRandomInt(2, 3);
    let rooms;
    do {
        rooms = Array.from({ length: count }, () => ({ length: getRandomInt(2, 9), width: getRandomInt(2, 9) }));
    } while (variant === 'largest' && (() => {
        const areas = rooms.map(r => r.length * r.width);
        return areas.filter(a => a === Math.max(...areas)).length > 1;
    })());
    const areas = rooms.map(r => r.length * r.width);
    if (variant === 'largest') {
        return { problem: { type: 'rooms', calculation, variant, rooms }, answer: areas.indexOf(Math.max(...areas)) + 1 };
    }
    const price = getRandomInt(5, 15);
    return { problem: { type: 'rooms', calculation, variant, rooms, price }, answer: price * areas.reduce((s, a) => s + a, 0) };
}

export function generateGeometryData({ shapeMix, calculationType, maxDimension, wholeNumbersOnly, numberOfProblems }) {
    if (isNaN(maxDimension) || maxDimension < 2) {
        throw new Error('Max dimension must be at least 2.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const digitalRoots = [];
    const availableShapes = ['rectangles', 'squares', 'triangles', 'circles'];

    for (let i = 0; i < numberOfProblems; i++) {
        if (INVERSE_TYPES.includes(calculationType)) {
            const { problem, answer } = generateInverseProblem(calculationType, shapeMix);
            problems.push(problem);
            digitalRoots.push({ digitalRoot: digitalRoot(answer) });
            continue;
        }
        const currentShape = shapeMix === 'mixed' ? getRandomFromArray(availableShapes) : shapeMix;
        const currentCalculation = calculationType === 'mixed' ? (getRandomInt(0, 1) === 0 ? 'area' : 'perimeter') : calculationType;

        let problemData = { type: currentShape, calculation: currentCalculation };
        let answer = 0;

        if (currentShape === 'rectangles') {
            const length = getRandomDimension(maxDimension, wholeNumbersOnly);
            const width = getRandomDimension(maxDimension, wholeNumbersOnly);
            problemData.length = length;
            problemData.width = width;
            answer = currentCalculation === 'area' ? length * width : 2 * (length + width);
        } else if (currentShape === 'squares') {
            const side = getRandomDimension(maxDimension, wholeNumbersOnly);
            problemData.side = side;
            answer = currentCalculation === 'area' ? side * side : 4 * side;
        } else if (currentShape === 'triangles') {
            if (currentCalculation === 'area') {
                const base = getRandomDimension(maxDimension, wholeNumbersOnly);
                const height = getRandomDimension(maxDimension, wholeNumbersOnly);
                problemData.base = base;
                problemData.height = height;
                answer = 0.5 * base * height;
            } else { // perimeter
                const side1 = getRandomDimension(maxDimension, wholeNumbersOnly);
                const side2 = getRandomDimension(maxDimension, wholeNumbersOnly);
                const side3 = getRandomDimension(maxDimension, wholeNumbersOnly);
                problemData.side1 = side1;
                problemData.side2 = side2;
                problemData.side3 = side3;
                answer = side1 + side2 + side3;
            }
        } else if (currentShape === 'circles') {
            const radius = getRandomDimension(maxDimension, wholeNumbersOnly);
            const pi = 3.14;
            problemData.radius = radius;
            problemData.pi = pi;
            answer = currentCalculation === 'area' ? pi * radius * radius : 2 * pi * radius;
        }

        problems.push(problemData);
        digitalRoots.push({ digitalRoot: digitalRoot(Math.round(answer)) });
    }

    return { problems, digitalRoots };
}