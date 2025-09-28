import { generateLinearEquationsNVarsData } from './generators/linear-equations-n-vars.js';

function testSingleVariableGeneration() {
    console.log('Testing single variable equation generation...');

    const config = {
        variableCount: 1,
        equationType: 'mixed',
        coefficientRange: 5,
        solutionRange: 10,
        allowNegativeSolutions: true,
        includeBrackets: false,
        numberOfProblems: 10
    };

    const result = generateLinearEquationsNVarsData(config);

    if (!result || !result.problems || !result.digitalRoots) {
        throw new Error('Generated result should have problems and digitalRoots arrays');
    }

    if (result.problems.length !== 10) {
        throw new Error(`Expected 10 problems, got ${result.problems.length}`);
    }

    result.problems.forEach((problem, index) => {
        if (!problem.text || !problem.type) {
            throw new Error(`Problem ${index} should have text and type`);
        }
    });

    console.log('All single variable generation tests passed!');
}

function testMultiVariableGeneration() {
    console.log('Testing multi-variable equation generation...');

    [2, 3, 4].forEach(varCount => {
        const config = {
            variableCount: varCount,
            systemType: 'general',
            coefficientRange: 3,
            solutionRange: 5,
            allowNegativeSolutions: false,
            integerSolutionsOnly: true,
            numberOfProblems: 5
        };

        const result = generateLinearEquationsNVarsData(config);

        if (result.problems.length !== 5) {
            throw new Error(`Expected 5 problems for ${varCount} variables, got ${result.problems.length}`);
        }

        result.problems.forEach((problem, index) => {
            if (!problem.equations || !Array.isArray(problem.equations)) {
                throw new Error(`Problem ${index} should have equations array`);
            }
            if (problem.equations.length !== varCount) {
                throw new Error(`Problem ${index} should have ${varCount} equations, got ${problem.equations.length}`);
            }
            if (!problem.solution || typeof problem.solution !== 'object') {
                throw new Error(`Problem ${index} should have solution object`);
            }
            if (Object.keys(problem.solution).length !== varCount) {
                throw new Error(`Problem ${index} should have ${varCount} solution variables`);
            }
        });
    });

    console.log('All multi-variable generation tests passed!');
}

function testBracketEquations() {
    console.log('Testing bracket equations...');

    const config = {
        variableCount: 1,
        equationType: 'with-brackets',
        coefficientRange: 5,
        solutionRange: 10,
        allowNegativeSolutions: false,
        includeBrackets: true,
        numberOfProblems: 10
    };

    const result = generateLinearEquationsNVarsData(config);

    result.problems.forEach((problem, index) => {
        if (problem.type === 'with-brackets' && !problem.text.includes('(')) {
            throw new Error(`Bracket problem ${index} should contain parentheses`);
        }
    });

    console.log('All bracket equation tests passed!');
}

function testSystemTypes() {
    console.log('Testing different system types...');

    const types = ['elimination-friendly', 'substitution-friendly', 'general', 'mixed'];

    types.forEach(type => {
        const config = {
            variableCount: 2,
            systemType: type,
            coefficientRange: 3,
            solutionRange: 5,
            allowNegativeSolutions: false,
            integerSolutionsOnly: true,
            numberOfProblems: 5
        };

        const result = generateLinearEquationsNVarsData(config);

        if (result.problems.length !== 5) {
            throw new Error(`System type ${type} should generate 5 problems`);
        }

        result.problems.forEach(problem => {
            if (type !== 'mixed' && problem.type !== type) {
                throw new Error(`Expected type ${type}, got ${problem.type}`);
            }
        });
    });

    console.log('All system type tests passed!');
}

function testVariableNaming() {
    console.log('Testing variable naming...');

    [1, 2, 3, 4].forEach(varCount => {
        const config = {
            variableCount: varCount,
            systemType: 'general',
            coefficientRange: 3,
            solutionRange: 5,
            allowNegativeSolutions: false,
            integerSolutionsOnly: true,
            numberOfProblems: 3
        };

        const result = generateLinearEquationsNVarsData(config);

        if (varCount > 1) {
            result.problems.forEach((problem, index) => {
                const expectedVars = ['x', 'y', 'z', 'w'].slice(0, varCount);
                const solutionVars = Object.keys(problem.solution);

                if (solutionVars.length !== varCount) {
                    throw new Error(`Problem ${index} should have ${varCount} variables in solution`);
                }

                expectedVars.forEach(expectedVar => {
                    if (!solutionVars.includes(expectedVar)) {
                        throw new Error(`Problem ${index} should include variable ${expectedVar}`);
                    }
                });
            });
        }
    });

    console.log('All variable naming tests passed!');
}

function testInputValidation() {
    console.log('Testing input validation...');

    const invalidConfigs = [
        { variableCount: 0, systemType: 'general', coefficientRange: 5, solutionRange: 10, numberOfProblems: 5 },
        { variableCount: 5, systemType: 'general', coefficientRange: 5, solutionRange: 10, numberOfProblems: 5 },
        { variableCount: 2, systemType: 'general', coefficientRange: 0, solutionRange: 10, numberOfProblems: 5 },
        { variableCount: 2, systemType: 'general', coefficientRange: 11, solutionRange: 10, numberOfProblems: 5 },
        { variableCount: 2, systemType: 'general', coefficientRange: 5, solutionRange: 0, numberOfProblems: 5 },
        { variableCount: 2, systemType: 'general', coefficientRange: 5, solutionRange: 51, numberOfProblems: 5 },
        { variableCount: 2, systemType: 'general', coefficientRange: 5, solutionRange: 10, numberOfProblems: 0 },
        { variableCount: 2, systemType: 'general', coefficientRange: 5, solutionRange: 10, numberOfProblems: 51 }
    ];

    invalidConfigs.forEach((config, index) => {
        try {
            generateLinearEquationsNVarsData({
                allowNegativeSolutions: false,
                integerSolutionsOnly: true,
                ...config
            });
            throw new Error(`Invalid config ${index} should have thrown an error`);
        } catch (error) {
            if (!error.message.includes('must be between') && !error.message.includes('Invalid number')) {
                throw new Error(`Config ${index} threw unexpected error: ${error.message}`);
            }
        }
    });

    console.log('All input validation tests passed!');
}

function testEquationFormatting() {
    console.log('Testing equation formatting...');

    const config = {
        variableCount: 3,
        systemType: 'general',
        coefficientRange: 5,
        solutionRange: 5,
        allowNegativeSolutions: true,
        integerSolutionsOnly: true,
        numberOfProblems: 5
    };

    const result = generateLinearEquationsNVarsData(config);

    result.problems.forEach((problem, index) => {
        problem.equations.forEach((equation, eqIndex) => {
            if (!equation.includes('=')) {
                throw new Error(`Equation ${eqIndex} in problem ${index} should contain '='`);
            }
            if (typeof equation !== 'string') {
                throw new Error(`Equation ${eqIndex} in problem ${index} should be a string`);
            }
        });
    });

    console.log('All equation formatting tests passed!');
}

// Run all tests
try {
    testSingleVariableGeneration();
    testMultiVariableGeneration();
    testBracketEquations();
    testSystemTypes();
    testVariableNaming();
    testInputValidation();
    testEquationFormatting();
    console.log('All N-variable linear equations tests passed!');
} catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
}