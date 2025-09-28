import { digitalRoot } from '../utils.js';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCoefficient(coefficientRange, allowZero = false) {
    if (allowZero) {
        return getRandomInt(-coefficientRange, coefficientRange);
    }
    const val = getRandomInt(1, coefficientRange);
    return Math.random() < 0.5 ? val : -val;
}

function getRandomSolution(solutionRange, allowNegativeSolutions) {
    const sol = getRandomInt(1, solutionRange);
    return allowNegativeSolutions && Math.random() < 0.3 ? -sol : sol;
}

function getVariableNames(count) {
    const names = ['x', 'y', 'z', 'w'];
    if (count <= names.length) {
        return names.slice(0, count);
    }
    // For more than 4 variables, use subscript notation
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(`x₍${i+1}₎`);
    }
    return result;
}

function formatCoefficient(coeff, variable, isFirst = false) {
    if (coeff === 0) return '';

    let sign = '';
    let absCoeff = Math.abs(coeff);

    if (isFirst) {
        sign = coeff < 0 ? '-' : '';
    } else {
        sign = coeff < 0 ? ' - ' : ' + ';
    }

    if (absCoeff === 1) {
        return `${sign}${variable}`;
    }
    return `${sign}${absCoeff}${variable}`;
}

function formatConstant(constant, isFirst = false) {
    if (isFirst) {
        return constant.toString();
    }

    if (constant < 0) {
        return ` - ${Math.abs(constant)}`;
    } else {
        return ` + ${constant}`;
    }
}

function formatEquation(coefficients, constant, variables, includeBrackets = false) {
    let equation = '';
    let hasTerms = false;

    // If brackets are enabled, randomly apply them to some equations
    if (includeBrackets && Math.random() < 0.4) {
        return formatEquationWithBrackets(coefficients, constant, variables);
    }

    for (let i = 0; i < coefficients.length; i++) {
        if (coefficients[i] !== 0) {
            equation += formatCoefficient(coefficients[i], variables[i], !hasTerms);
            hasTerms = true;
        }
    }

    // If no terms (all coefficients are 0), make it "0"
    if (!hasTerms) {
        equation = '0';
    }

    equation += ` = ${constant}`;
    return equation;
}

function formatEquationWithBrackets(coefficients, constant, variables) {
    // Strategy: Group 2-3 terms in brackets with a coefficient
    const nonZeroIndices = coefficients.map((coeff, index) => ({ coeff, index }))
                                      .filter(item => item.coeff !== 0);

    if (nonZeroIndices.length < 2) {
        // Not enough terms for brackets, fall back to normal formatting
        return formatEquation(coefficients, constant, variables, false);
    }

    const bracketType = Math.floor(Math.random() * 3);

    if (bracketType === 0) {
        // Type 1: a(x + y) + other terms
        const groupSize = Math.min(2, nonZeroIndices.length);
        const groupCoeff = Math.random() < 0.5 ? 2 : 3;

        let equation = '';
        let hasTerms = false;

        // Create bracket group
        let bracketTerms = '';
        let bracketHasTerms = false;
        for (let i = 0; i < groupSize; i++) {
            const item = nonZeroIndices[i];
            const termCoeff = Math.round(item.coeff / groupCoeff) || 1;
            bracketTerms += formatCoefficient(termCoeff, variables[item.index], !bracketHasTerms);
            bracketHasTerms = true;
        }

        if (bracketHasTerms) {
            equation += `${groupCoeff}(${bracketTerms})`;
            hasTerms = true;
        }

        // Add remaining terms
        for (let i = groupSize; i < nonZeroIndices.length; i++) {
            const item = nonZeroIndices[i];
            equation += formatCoefficient(item.coeff, variables[item.index], !hasTerms);
            hasTerms = true;
        }

        equation += ` = ${constant}`;
        return equation;

    } else if (bracketType === 1) {
        // Type 2: (ax + by) + cz + ...
        const groupSize = Math.min(2, nonZeroIndices.length);

        let equation = '';
        let hasTerms = false;

        // Create bracket group without external coefficient
        let bracketTerms = '';
        let bracketHasTerms = false;
        for (let i = 0; i < groupSize; i++) {
            const item = nonZeroIndices[i];
            bracketTerms += formatCoefficient(item.coeff, variables[item.index], !bracketHasTerms);
            bracketHasTerms = true;
        }

        if (bracketHasTerms) {
            equation += `(${bracketTerms})`;
            hasTerms = true;
        }

        // Add remaining terms
        for (let i = groupSize; i < nonZeroIndices.length; i++) {
            const item = nonZeroIndices[i];
            equation += formatCoefficient(item.coeff, variables[item.index], !hasTerms);
            hasTerms = true;
        }

        equation += ` = ${constant}`;
        return equation;

    } else {
        // Type 3: Multiple bracket groups (for 3+ variables)
        if (nonZeroIndices.length >= 4) {
            const group1Size = 2;
            const group2Size = 2;

            let equation = '';
            let hasTerms = false;

            // First bracket group
            let bracketTerms1 = '';
            let bracket1HasTerms = false;
            for (let i = 0; i < group1Size; i++) {
                const item = nonZeroIndices[i];
                bracketTerms1 += formatCoefficient(item.coeff, variables[item.index], !bracket1HasTerms);
                bracket1HasTerms = true;
            }

            if (bracket1HasTerms) {
                equation += `(${bracketTerms1})`;
                hasTerms = true;
            }

            // Second bracket group
            let bracketTerms2 = '';
            let bracket2HasTerms = false;
            for (let i = group1Size; i < group1Size + group2Size && i < nonZeroIndices.length; i++) {
                const item = nonZeroIndices[i];
                bracketTerms2 += formatCoefficient(item.coeff, variables[item.index], !bracket2HasTerms);
                bracket2HasTerms = true;
            }

            if (bracket2HasTerms) {
                const sign = hasTerms ? (Math.random() < 0.5 ? ' + ' : ' - ') : '';
                equation += `${sign}(${bracketTerms2})`;
                hasTerms = true;
            }

            // Add remaining terms
            for (let i = group1Size + group2Size; i < nonZeroIndices.length; i++) {
                const item = nonZeroIndices[i];
                equation += formatCoefficient(item.coeff, variables[item.index], !hasTerms);
                hasTerms = true;
            }

            equation += ` = ${constant}`;
            return equation;
        } else {
            // Fall back to type 1 for fewer variables
            return formatEquationWithBrackets(coefficients, constant, variables);
        }
    }
}

function generateSingleVariableEquation(variableNames, equationType, coefficientRange, solutionRange, allowNegativeSolutions, includeBrackets) {
    const solution = getRandomSolution(solutionRange, allowNegativeSolutions);
    const variable = variableNames[0];

    // Handle bracket equations for single variable
    if (includeBrackets && (equationType === 'with-brackets' || (equationType === 'mixed' && Math.random() < 0.2))) {
        const bracketType = Math.floor(Math.random() * 5);

        if (bracketType === 0) { // a(x + b) = c
            const a = getRandomCoefficient(coefficientRange);
            const b = getRandomCoefficient(coefficientRange);
            const c = a * (solution + b);
            return { text: `${a}(${variable} + ${b}) = ${c}`, type: 'with-brackets' };
        } else if (bracketType === 1) { // a(x - b) = c
            const a = getRandomCoefficient(coefficientRange);
            const b = getRandomCoefficient(coefficientRange);
            const c = a * (solution - b);
            return { text: `${a}(${variable} - ${b}) = ${c}`, type: 'with-brackets' };
        } else if (bracketType === 2) { // (x + a) + b = c
            const a = getRandomCoefficient(coefficientRange);
            const b = getRandomCoefficient(coefficientRange);
            const c = solution + a + b;
            return { text: `(${variable} + ${a}) + ${b} = ${c}`, type: 'with-brackets' };
        } else if (bracketType === 3) { // a(bx + c) = d
            const a = getRandomCoefficient(Math.min(coefficientRange, 3));
            const b = getRandomCoefficient(Math.min(coefficientRange, 3));
            const c = getRandomCoefficient(coefficientRange);
            const d = a * (b * solution + c);
            return { text: `${a}(${b}${variable} + ${c}) = ${d}`, type: 'with-brackets' };
        } else { // a + b(x + c) = d
            const a = getRandomCoefficient(coefficientRange);
            const b = getRandomCoefficient(coefficientRange);
            const c = getRandomCoefficient(coefficientRange);
            const d = a + b * (solution + c);
            return { text: `${a} + ${b}(${variable} + ${c}) = ${d}`, type: 'with-brackets' };
        }
    }

    // Standard single variable equations
    const availableTypes = ['one-step', 'two-step', 'with-fractions'];
    const currentType = equationType === 'mixed' ? availableTypes[Math.floor(Math.random() * availableTypes.length)] : equationType;

    if (currentType === 'one-step') {
        const operationType = Math.floor(Math.random() * 3);
        if (operationType === 0) { // x + a = b
            const a = getRandomCoefficient(coefficientRange);
            const b = solution + a;
            return { text: `${variable}${formatConstant(a)} = ${b}`, type: 'one-step' };
        } else if (operationType === 1) { // x - a = b
            const a = getRandomCoefficient(coefficientRange);
            const b = solution - a;
            return { text: `${variable}${formatConstant(-a)} = ${b}`, type: 'one-step' };
        } else { // a - x = b
            const a = Math.abs(solution) + Math.abs(getRandomCoefficient(coefficientRange));
            const b = a - solution;
            return { text: `${a} - ${variable} = ${b}`, type: 'one-step' };
        }
    } else if (currentType === 'two-step') {
        const a = getRandomCoefficient(coefficientRange);
        const b = getRandomCoefficient(coefficientRange);
        if (Math.random() < 0.5) { // ax + b = c
            const c = a * solution + b;
            return { text: `${formatCoefficient(a, variable, true)}${formatConstant(b)} = ${c}`, type: 'two-step' };
        } else { // ax - b = c
            const c = a * solution - b;
            return { text: `${formatCoefficient(a, variable, true)}${formatConstant(-b)} = ${c}`, type: 'two-step' };
        }
    } else if (currentType === 'with-fractions') {
        const a = getRandomInt(2, Math.min(coefficientRange, 5));
        const b = getRandomCoefficient(coefficientRange);
        const c = Math.round(solution / a) + b;
        return { text: `${variable}/${a}${formatConstant(b)} = ${c}`, type: 'with-fractions' };
    }
}

function generateSystemOfEquations(variableCount, variables, systemType, coefficientRange, solutionRange, allowNegativeSolutions, integerSolutionsOnly, includeBrackets = false) {
    let attempts = 0;
    const maxAttempts = 100;

    do {
        attempts++;

        // Generate solution vector
        const solution = [];
        for (let i = 0; i < variableCount; i++) {
            solution.push(getRandomSolution(solutionRange, allowNegativeSolutions));
        }

        // Generate coefficient matrix
        const matrix = [];
        const constants = [];

        for (let i = 0; i < variableCount; i++) {
            const row = [];

            if (systemType === 'elimination-friendly' && i > 0) {
                // Make some coefficients the same or opposite for elimination
                const prevRow = matrix[i - 1];
                if (Math.random() < 0.5) {
                    // Same coefficient for easy elimination
                    const colIndex = Math.floor(Math.random() * variableCount);
                    row[colIndex] = prevRow[colIndex];
                    for (let j = 0; j < variableCount; j++) {
                        if (j !== colIndex) {
                            row[j] = getRandomCoefficient(coefficientRange);
                        }
                    }
                } else {
                    // Opposite coefficient for easy elimination
                    const colIndex = Math.floor(Math.random() * variableCount);
                    row[colIndex] = -prevRow[colIndex];
                    for (let j = 0; j < variableCount; j++) {
                        if (j !== colIndex) {
                            row[j] = getRandomCoefficient(coefficientRange);
                        }
                    }
                }
            } else if (systemType === 'substitution-friendly' && i === 0) {
                // Make first equation easy for substitution (coefficient of 1 or -1)
                const varIndex = Math.floor(Math.random() * variableCount);
                for (let j = 0; j < variableCount; j++) {
                    if (j === varIndex) {
                        row[j] = Math.random() < 0.5 ? 1 : -1;
                    } else {
                        row[j] = getRandomCoefficient(coefficientRange);
                    }
                }
            } else {
                // General case
                for (let j = 0; j < variableCount; j++) {
                    row[j] = getRandomCoefficient(coefficientRange);
                }
            }

            matrix.push(row);

            // Calculate constant term
            let constant = 0;
            for (let j = 0; j < variableCount; j++) {
                constant += row[j] * solution[j];
            }
            constants.push(constant);
        }

        // Check if system has unique solution (simplified determinant check for small systems)
        if (variableCount === 2) {
            const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
            if (Math.abs(det) < 0.001) continue; // Nearly singular
        }

        // Generate equation strings
        const equations = [];
        for (let i = 0; i < variableCount; i++) {
            equations.push(formatEquation(matrix[i], constants[i], variables, includeBrackets));
        }

        return {
            equations,
            solution: Object.fromEntries(variables.map((variable, i) => [variable, solution[i]])),
            type: systemType
        };

    } while (attempts < maxAttempts);

    // Fallback system
    const equations = [];
    const solution = {};
    for (let i = 0; i < variableCount; i++) {
        solution[variables[i]] = 1;
        const coeffs = new Array(variableCount).fill(0);
        coeffs[i] = 1;
        equations.push(formatEquation(coeffs, 1, variables, includeBrackets));
    }

    return { equations, solution, type: 'fallback' };
}

export function generateLinearEquationsNVarsData({
    variableCount,
    equationType,
    systemType,
    coefficientRange,
    solutionRange,
    allowNegativeSolutions,
    integerSolutionsOnly,
    includeBrackets,
    numberOfProblems
}) {
    if (isNaN(variableCount) || variableCount < 1 || variableCount > 4) {
        throw new Error('Variable count must be between 1 and 4.');
    }
    if (isNaN(coefficientRange) || coefficientRange < 1 || coefficientRange > 10) {
        throw new Error('Coefficient range must be between 1 and 10.');
    }
    if (isNaN(solutionRange) || solutionRange < 1 || solutionRange > 50) {
        throw new Error('Solution range must be between 1 and 50.');
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const problems = [];
    const digitalRoots = [];
    const variables = getVariableNames(variableCount);

    for (let i = 0; i < numberOfProblems; i++) {
        let problemData;
        let solutionSum = 0;

        if (variableCount === 1) {
            // Single variable equation
            problemData = generateSingleVariableEquation(
                variables, equationType, coefficientRange, solutionRange, allowNegativeSolutions, includeBrackets
            );
            // For single variable, we need to solve to get the actual solution for digital root
            solutionSum = getRandomSolution(solutionRange, allowNegativeSolutions);
        } else {
            // System of equations
            problemData = generateSystemOfEquations(
                variableCount, variables, systemType, coefficientRange, solutionRange, allowNegativeSolutions, integerSolutionsOnly, includeBrackets
            );
            // Sum of absolute values of all variables
            solutionSum = Object.values(problemData.solution).reduce((sum, val) => sum + Math.abs(val), 0);
        }

        problems.push(problemData);
        digitalRoots.push({ digitalRoot: digitalRoot(solutionSum) });
    }

    return { problems, digitalRoots };
}