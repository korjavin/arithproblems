function getRandomNumber(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

function buildPyramid(baseNumbers) {
    const pyramid = [baseNumbers.slice()];
    for (let layer = 0; layer < baseNumbers.length - 1; layer++) {
        const nextLayer = [];
        for (let i = 0; i < pyramid[layer].length - 1; i++) {
            nextLayer.push(pyramid[layer][i] + pyramid[layer][i + 1]);
        }
        pyramid.push(nextLayer);
    }
    return pyramid;
}

export function generatePyramidProblemsData({ pyramidSize, range, missingType, numberOfProblems }) {
    if (isNaN(pyramidSize) || pyramidSize < 3 || pyramidSize > 5) {
        throw new Error('Pyramid size must be between 3 and 5.');
    }
    if (!range || typeof range !== 'string' || !range.includes('-')) {
        throw new Error('Invalid range provided.');
    }
    const [min, max] = range.split('-').map(n => parseInt(n, 10));
    if (isNaN(min) || isNaN(max)) {
        throw new Error('Range contains non-numeric values.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 20) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const baseNumbers = [];
        for (let j = 0; j < pyramidSize; j++) {
            baseNumbers.push(getRandomNumber(min, Math.floor(max / pyramidSize)));
        }

        const completePyramid = buildPyramid(baseNumbers);
        const displayPyramid = completePyramid.map(layer => layer.slice());

        switch (missingType) {
            case 'top':
                displayPyramid[displayPyramid.length - 1][0] = '?';
                break;
            case 'middle':
                for (let layer = 1; layer < displayPyramid.length - 1; layer++) {
                    const hideCount = Math.random() < 0.5 ? 1 : 2;
                    for (let h = 0; h < hideCount && h < displayPyramid[layer].length; h++) {
                        const randomPos = Math.floor(Math.random() * displayPyramid[layer].length);
                        displayPyramid[layer][randomPos] = '?';
                    }
                }
                break;
            case 'bottom':
                 for (let layer = 1; layer < displayPyramid.length; layer++) {
                      for (let pos = 0; pos < displayPyramid[layer].length; pos++) {
                          displayPyramid[layer][pos] = '?';
                      }
                  }
                break;
            case 'random':
            default:
                const totalPositions = completePyramid.flat().length;
                const hideCount = Math.min(Math.floor(totalPositions * 0.3), 4);
                const hiddenPositions = new Set();
                while (hiddenPositions.size < hideCount) {
                    const layer = Math.floor(Math.random() * displayPyramid.length);
                    const pos = Math.floor(Math.random() * displayPyramid[layer].length);
                    const key = `${layer}-${pos}`;
                    if (!hiddenPositions.has(key)) {
                        hiddenPositions.add(key);
                        displayPyramid[layer][pos] = '?';
                    }
                }
                break;
        }
        problems.push({ pyramid: displayPyramid });
    }

    return { problems };
}