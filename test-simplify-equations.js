import assert from 'assert';
import { readFileSync } from 'fs';
import { generateSimplifyEquationsData } from './generators/simplify-equations.js';

function testGenerateSimplifyEquationsData() {
    console.log('--- Running tests for generateSimplifyEquationsData ---');

    // Test case 1: Basic functionality - no brackets, small coefficient range
    let params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 5 };
    let result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 1 Failed: Should generate 5 problems');
    assert.strictEqual(result.controlSums.length, 5, 'Test Case 1 Failed: Should generate 5 control sums');
    console.log('Test Case 1 Passed: Basic functionality with no brackets');

    // Test case 2: With brackets enabled
    params = { numOperations: 3, includeBrackets: true, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 10 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 10, 'Test Case 2 Failed: Should generate 10 problems');
    assert.strictEqual(result.controlSums.length, 10, 'Test Case 2 Failed: Should generate 10 control sums');
    console.log('Test Case 2 Passed: With brackets enabled');

    // Test case 3: Check problem structure
    params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 1 };
    result = generateSimplifyEquationsData(params);
    const problem = result.problems[0];
    assert.strictEqual(typeof problem.expression, 'string', 'Test Case 3 Failed: Expression should be a string');
    assert(problem.expression.length > 0, 'Test Case 3 Failed: Expression should not be empty');
    console.log('Test Case 3 Passed: Problem structure');

    // Test case 4: Check control sum structure
    const controlSum = result.controlSums[0];
    assert.strictEqual(typeof controlSum.controlSum, 'number', 'Test Case 4 Failed: Control sum should be a number');
    assert(controlSum.controlSum >= 0 && controlSum.controlSum <= 9, 'Test Case 4 Failed: Control sum should be a single digit');
    console.log('Test Case 4 Passed: Control sum structure');

    // Test case 5: No brackets - expressions should not contain parentheses from brackets
    params = { numOperations: 4, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 20 };
    result = generateSimplifyEquationsData(params);
    for (const p of result.problems) {
        assert(!p.expression.includes('('), `Test Case 5 Failed: Expression "${p.expression}" should not contain brackets when includeBrackets is false`);
    }
    console.log('Test Case 5 Passed: No brackets when includeBrackets is false');

    // Test case 6: Higher bracket depth
    params = { numOperations: 3, includeBrackets: true, bracketDepth: 3, coefficientRange: 10, numberOfProblems: 10 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 10, 'Test Case 6 Failed: Should generate 10 problems');
    for (const p of result.problems) {
        assert(typeof p.expression === 'string' && p.expression.length > 0, 'Test Case 6 Failed: Expression should be a non-empty string');
    }
    console.log('Test Case 6 Passed: Higher bracket depth');

    // Test case 7: Large coefficient range
    params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 50, numberOfProblems: 5 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 7 Failed: Should generate 5 problems');
    console.log('Test Case 7 Passed: Large coefficient range');

    // Test case 8: Small coefficient range
    params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 5, numberOfProblems: 5 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 8 Failed: Should generate 5 problems');
    console.log('Test Case 8 Passed: Small coefficient range');

    // Test case 9: Many operations
    params = { numOperations: 6, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 5 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 5, 'Test Case 9 Failed: Should generate 5 problems');
    console.log('Test Case 9 Passed: Many operations (6)');

    // Test case 10: Brackets with depth 2
    params = { numOperations: 3, includeBrackets: true, bracketDepth: 2, coefficientRange: 10, numberOfProblems: 10 };
    result = generateSimplifyEquationsData(params);
    assert.strictEqual(result.problems.length, 10, 'Test Case 10 Failed: Should generate 10 problems');
    for (const cs of result.controlSums) {
        assert(typeof cs.controlSum === 'number' && cs.controlSum >= 0 && cs.controlSum <= 9, 'Test Case 10 Failed: Control sum should be valid');
    }
    console.log('Test Case 10 Passed: Brackets with depth 2');

    // Test case 11: includeBrackets=true should produce some expressions with parentheses
    params = { numOperations: 4, includeBrackets: true, bracketDepth: 2, coefficientRange: 10, numberOfProblems: 50 };
    result = generateSimplifyEquationsData(params);
    const hasBrackets = result.problems.some(p => p.expression.includes('('));
    assert(hasBrackets, 'Test Case 11 Failed: With includeBrackets=true and 50 problems, at least one should contain brackets');
    console.log('Test Case 11 Passed: includeBrackets=true produces brackets');

    // Test case 12: coefficientRange constrains coefficient values
    params = { numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 5, numberOfProblems: 30 };
    result = generateSimplifyEquationsData(params);
    for (const p of result.problems) {
        // Extract all numbers from expression (before ⋅ replacement, numbers are plain digits)
        const numbers = p.expression.match(/\d+/g) || [];
        for (const numStr of numbers) {
            const num = parseInt(numStr, 10);
            assert(num <= 5, `Test Case 12 Failed: Coefficient ${num} in "${p.expression}" exceeds range 5`);
        }
    }
    console.log('Test Case 12 Passed: coefficientRange constrains coefficient values');

    // Test case 13: more numOperations produces longer expressions
    const short = generateSimplifyEquationsData({ numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 20 });
    const long = generateSimplifyEquationsData({ numOperations: 6, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 20 });
    const avgShortLen = short.problems.reduce((sum, p) => sum + p.expression.length, 0) / short.problems.length;
    const avgLongLen = long.problems.reduce((sum, p) => sum + p.expression.length, 0) / long.problems.length;
    assert(avgLongLen > avgShortLen, `Test Case 13 Failed: 6-operation expressions (avg ${avgLongLen}) should be longer than 2-operation (avg ${avgShortLen})`);
    console.log('Test Case 13 Passed: more numOperations produces longer expressions');

    // Test case 14: Invalid numOperations - too low
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: 1, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 5 });
    }, /Invalid number of operations/, 'Test Case 14 Failed: numOperations=1 should throw');
    console.log('Test Case 14 Passed: numOperations=1 throws');

    // Test case 15: Invalid numOperations - too high
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: 7, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 5 });
    }, /Invalid number of operations/, 'Test Case 15 Failed: numOperations=7 should throw');
    console.log('Test Case 15 Passed: numOperations=7 throws');

    // Test case 16: Invalid numOperations - NaN
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: NaN, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 5 });
    }, /Invalid number of operations/, 'Test Case 16 Failed: numOperations=NaN should throw');
    console.log('Test Case 16 Passed: numOperations=NaN throws');

    // Test case 17: Invalid bracketDepth
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: 2, includeBrackets: true, bracketDepth: 0, coefficientRange: 10, numberOfProblems: 5 });
    }, /Invalid bracket depth/, 'Test Case 17 Failed: bracketDepth=0 should throw');
    console.log('Test Case 17 Passed: bracketDepth=0 throws');

    // Test case 18: Invalid coefficientRange - too low
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 2, numberOfProblems: 5 });
    }, /Invalid coefficient range/, 'Test Case 18 Failed: coefficientRange=2 should throw');
    console.log('Test Case 18 Passed: coefficientRange=2 throws');

    // Test case 19: Invalid coefficientRange - too high
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 100, numberOfProblems: 5 });
    }, /Invalid coefficient range/, 'Test Case 19 Failed: coefficientRange=100 should throw');
    console.log('Test Case 19 Passed: coefficientRange=100 throws');

    // Test case 20: Invalid numberOfProblems
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 0 });
    }, /Invalid number of problems/, 'Test Case 20 Failed: numberOfProblems=0 should throw');
    console.log('Test Case 20 Passed: numberOfProblems=0 throws');

    // Test case 21: Invalid numberOfProblems - too high
    assert.throws(() => {
        generateSimplifyEquationsData({ numOperations: 2, includeBrackets: false, bracketDepth: 1, coefficientRange: 10, numberOfProblems: 51 });
    }, /Invalid number of problems/, 'Test Case 21 Failed: numberOfProblems=51 should throw');
    console.log('Test Case 21 Passed: numberOfProblems=51 throws');

    console.log('--- All tests for generateSimplifyEquationsData passed ---');
}

function testScriptReadsCorrectControlIDs() {
    console.log('--- Running tests for script.js control ID wiring ---');
    const scriptContent = readFileSync('./script.js', 'utf8');

    // Extract the renderSimplifyEquationsProblems function body
    const fnMatch = scriptContent.match(/function renderSimplifyEquationsProblems[\s\S]*?^    \}/m);
    assert(fnMatch, 'renderSimplifyEquationsProblems function should exist in script.js');
    const fnBody = fnMatch[0];

    // Verify all new control IDs are referenced
    const expectedIDs = ['se-num-operations', 'se-include-brackets', 'se-bracket-depth', 'se-coefficient-range'];
    for (const id of expectedIDs) {
        assert(fnBody.includes(id), `script.js renderSimplifyEquationsProblems should reference control '${id}'`);
    }
    console.log('Test Passed: All granular control IDs are referenced in renderSimplifyEquationsProblems');

    // Verify old complexity control is NOT referenced
    assert(!fnBody.includes('se-complexity'), 'script.js renderSimplifyEquationsProblems should NOT reference old se-complexity control');
    console.log('Test Passed: Old se-complexity control is no longer referenced');

    // Verify the generator is called with correct parameter names
    const expectedParams = ['numOperations', 'includeBrackets', 'bracketDepth', 'coefficientRange', 'numberOfProblems'];
    for (const param of expectedParams) {
        assert(fnBody.includes(param), `Generator call should include parameter '${param}'`);
    }
    console.log('Test Passed: Generator is called with all correct parameter names');

    console.log('--- All script.js control ID wiring tests passed ---');
}

function testLocaleTranslationKeys() {
    console.log('--- Running tests for locale translation keys ---');

    const locales = ['en', 'ru', 'de'];
    const requiredKeys = ['num_operations_label', 'include_brackets_label', 'bracket_depth_label', 'coefficient_range_label', 'description'];
    const removedKeys = ['complexity_label'];

    for (const locale of locales) {
        const data = JSON.parse(readFileSync(`./locales/${locale}.json`, 'utf8'));
        const se = data.script.simplify_equations;

        for (const key of requiredKeys) {
            assert(se[key], `${locale}.json simplify_equations should have key '${key}'`);
            assert(typeof se[key] === 'string' && se[key].length > 0, `${locale}.json simplify_equations.${key} should be a non-empty string`);
        }

        for (const key of removedKeys) {
            assert(!se[key], `${locale}.json simplify_equations should NOT have old key '${key}'`);
        }

        console.log(`Test Passed: ${locale}.json has correct simplify_equations translation keys`);
    }

    console.log('--- All locale translation key tests passed ---');
}

try {
    testGenerateSimplifyEquationsData();
    testScriptReadsCorrectControlIDs();
    testLocaleTranslationKeys();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
