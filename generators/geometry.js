import { digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

function getRandomDimension(maxDimension, wholeNumbersOnly) {
    if (wholeNumbersOnly) {
        return getRandomInt(2, maxDimension);
    }
    // 0.5 increments
    return Math.round((getRandomInt(0, (maxDimension - 2) * 2) / 2 + 2) * 2) / 2;
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