import { generateLinearEquationsTwoVarsData } from './generators/linear-equations-two-vars.js';

function testProblemGeneration() {
    console.log('Testing two-variable linear equations problem generation...');

    const config = {
        systemType: 'general',
        coefficientRange: 5,
        solutionRange: 10,
        allowNegativeSolutions: true,
        integerSolutionsOnly: true,
        numberOfProblems: 10
    };

    const result = generateLinearEquationsTwoVarsData(config);

    if (!result || !result.problems || !result.digitalRoots) {
        throw new Error('Generated result should have problems and digitalRoots arrays');
    }

    if (result.problems.length !== 10) {
        throw new Error(`Expected 10 problems, got ${result.problems.length}`);
    }

    if (result.digitalRoots.length !== 10) {
        throw new Error(`Expected 10 digital roots, got ${result.digitalRoots.length}`);
    }

    // Check problem structure
    result.problems.forEach((problem, index) => {
        if (!problem.equation1 || !problem.equation2) {
            throw new Error(`Problem ${index} should have equation1 and equation2`);
        }
        if (!problem.solution || typeof problem.solution.x === 'undefined' || typeof problem.solution.y === 'undefined') {
            throw new Error(`Problem ${index} should have solution with x and y values`);
        }
        if (!problem.type) {
            throw new Error(`Problem ${index} should have a type`);
        }
    });

    // Check digital roots structure
    result.digitalRoots.forEach((root, index) => {
        if (typeof root.digitalRoot !== 'number' || root.digitalRoot < 1 || root.digitalRoot > 9) {
            throw new Error(`Digital root ${index} should be a number between 1 and 9`);
        }
    });

    console.log('All problem generation tests passed!');
}

function testSystemTypes() {
    console.log('Testing system types...');

    const types = ['elimination-friendly', 'substitution-friendly', 'general', 'mixed'];

    types.forEach(type => {
        const config = {
            systemType: type,
            coefficientRange: 3,
            solutionRange: 5,
            allowNegativeSolutions: false,
            integerSolutionsOnly: true,
            numberOfProblems: 5
        };

        const result = generateLinearEquationsTwoVarsData(config);

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

function testIntegerSolutionsOnly() {
    console.log('Testing integer solutions only option...');

    const config = {
        systemType: 'general',
        coefficientRange: 3,
        solutionRange: 5,
        allowNegativeSolutions: true,
        integerSolutionsOnly: true,
        numberOfProblems: 10
    };

    const result = generateLinearEquationsTwoVarsData(config);

    result.problems.forEach((problem, index) => {
        const { x, y } = problem.solution;
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error(`Problem ${index} should have integer solutions, got x=${x}, y=${y}`);
        }
    });

    console.log('All "integer solutions only" tests passed!');
}

function testNegativeSolutions() {
    console.log('Testing negative solutions option...');

    const configWithNegative = {
        systemType: 'general',
        coefficientRange: 3,
        solutionRange: 5,
        allowNegativeSolutions: true,
        integerSolutionsOnly: true,
        numberOfProblems: 20
    };

    const configWithoutNegative = {
        systemType: 'general',
        coefficientRange: 3,
        solutionRange: 5,
        allowNegativeSolutions: false,
        integerSolutionsOnly: true,
        numberOfProblems: 20
    };

    const resultWith = generateLinearEquationsTwoVarsData(configWithNegative);
    const resultWithout = generateLinearEquationsTwoVarsData(configWithoutNegative);

    // Check that negative solutions are not present when disabled
    resultWithout.problems.forEach((problem, index) => {
        const { x, y } = problem.solution;
        if (x < 0 || y < 0) {
            throw new Error(`Problem ${index} should not have negative solutions when disabled, got x=${x}, y=${y}`);
        }
    });

    console.log('All negative solutions tests passed!');
}

function testInputValidation() {
    console.log('Testing input validation...');

    const invalidConfigs = [
        { coefficientRange: 0, solutionRange: 5, numberOfProblems: 5 },
        { coefficientRange: 11, solutionRange: 5, numberOfProblems: 5 },
        { coefficientRange: 5, solutionRange: 0, numberOfProblems: 5 },
        { coefficientRange: 5, solutionRange: 21, numberOfProblems: 5 },
        { coefficientRange: 5, solutionRange: 5, numberOfProblems: 0 },
        { coefficientRange: 5, solutionRange: 5, numberOfProblems: 51 }
    ];

    invalidConfigs.forEach((config, index) => {
        try {
            generateLinearEquationsTwoVarsData({
                systemType: 'general',
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
        systemType: 'general',
        coefficientRange: 5,
        solutionRange: 5,
        allowNegativeSolutions: true,
        integerSolutionsOnly: true,
        numberOfProblems: 10
    };

    const result = generateLinearEquationsTwoVarsData(config);

    result.problems.forEach((problem, index) => {
        // Check that equations contain x, y, and =
        if (!problem.equation1.includes('=')) {
            throw new Error(`Equation 1 in problem ${index} should contain '='`);
        }
        if (!problem.equation2.includes('=')) {
            throw new Error(`Equation 2 in problem ${index} should contain '='`);
        }

        // Check that equations are strings
        if (typeof problem.equation1 !== 'string' || typeof problem.equation2 !== 'string') {
            throw new Error(`Equations in problem ${index} should be strings`);
        }
    });

    console.log('All equation formatting tests passed!');
}

// Run all tests
try {
    testProblemGeneration();
    testSystemTypes();
    testIntegerSolutionsOnly();
    testNegativeSolutions();
    testInputValidation();
    testEquationFormatting();
    console.log('All two-variable linear equations tests passed!');
} catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
}