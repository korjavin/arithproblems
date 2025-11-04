import { generateSimplifyRationalsData } from './generators/simplify-rationals.js';
import assert from 'assert';

function testGenerateSimplifyRationalsData() {
    console.log('Testing generateSimplifyRationalsData...');

    // Test basic generation with complexity 1
    const result1 = generateSimplifyRationalsData({ complexity: 1, numberOfProblems: 5 });
    assert.strictEqual(result1.problems.length, 5, 'Should generate 5 problems for complexity 1');
    assert.strictEqual(result1.controlSums.length, 5, 'Should generate 5 control sums for complexity 1');

    // Test with different complexity levels
    for (let complexity = 1; complexity <= 5; complexity++) {
        const result = generateSimplifyRationalsData({ complexity, numberOfProblems: 10 });

        assert.strictEqual(result.problems.length, 10, `Should generate 10 problems for complexity ${complexity}`);
        assert.strictEqual(result.controlSums.length, 10, `Should generate 10 control sums for complexity ${complexity}`);

        // Verify structure
        assert(Array.isArray(result.problems), 'Problems should be an array');
        assert(Array.isArray(result.controlSums), 'Control sums should be an array');

        // Test each problem structure
        result.problems.forEach((problem, i) => {
            assert(problem.type, `Problem ${i} should have a type property`);
            assert(['single', 'operation'].includes(problem.type), `Problem ${i} type should be 'single' or 'operation'`);

            if (problem.type === 'single') {
                assert(typeof problem.numerator === 'string', `Problem ${i} numerator should be a string`);
                assert(typeof problem.denominator === 'string', `Problem ${i} denominator should be a string`);
                assert(problem.numerator.length > 0, `Problem ${i} numerator should not be empty`);
                assert(problem.denominator.length > 0, `Problem ${i} denominator should not be empty`);
            } else if (problem.type === 'operation') {
                assert(Array.isArray(problem.fractions), `Problem ${i} fractions should be an array`);
                assert(Array.isArray(problem.operations), `Problem ${i} operations should be an array`);
                assert(problem.fractions.length > 1, `Problem ${i} should have at least 2 fractions`);
                assert(problem.operations.length === problem.fractions.length - 1, `Problem ${i} should have n-1 operations for n fractions`);

                // Check each fraction
                problem.fractions.forEach((frac, j) => {
                    assert(typeof frac.numerator === 'string', `Fraction ${j} numerator should be a string`);
                    assert(typeof frac.denominator === 'string', `Fraction ${j} denominator should be a string`);
                });

                // Check operations are valid
                problem.operations.forEach((op, j) => {
                    assert(['+', '-', '·', '÷'].includes(op), `Operation ${j} should be a valid operator, got ${op}`);
                });
            }
        });

        // Test each control sum
        result.controlSums.forEach((cs, i) => {
            assert(typeof cs.controlSum === 'number', `Control sum ${i} should be a number`);
            assert(cs.controlSum >= 0 && cs.controlSum <= 9, `Control sum ${i} should be between 0 and 9, got ${cs.controlSum}`);
        });
    }

    // Test edge cases
    const result2 = generateSimplifyRationalsData({ complexity: 1, numberOfProblems: 1 });
    assert.strictEqual(result2.problems.length, 1, 'Should handle numberOfProblems = 1');

    const result3 = generateSimplifyRationalsData({ complexity: 5, numberOfProblems: 50 });
    assert.strictEqual(result3.problems.length, 50, 'Should handle larger number of problems');

    // Test that higher complexity levels include operation types
    const result4 = generateSimplifyRationalsData({ complexity: 3, numberOfProblems: 20 });
    const hasOperationType = result4.problems.some(p => p.type === 'operation');
    assert(hasOperationType, 'Complexity 3+ should include problems with operations');

    // Test invalid inputs
    try {
        generateSimplifyRationalsData({ complexity: 0, numberOfProblems: 5 });
        assert.fail('Should throw error for complexity < 1');
    } catch (error) {
        assert(error.message.includes('Complexity'), 'Should throw error about complexity');
    }

    try {
        generateSimplifyRationalsData({ complexity: 6, numberOfProblems: 5 });
        assert.fail('Should throw error for complexity > 5');
    } catch (error) {
        assert(error.message.includes('Complexity'), 'Should throw error about complexity');
    }

    try {
        generateSimplifyRationalsData({ complexity: 1, numberOfProblems: 0 });
        assert.fail('Should throw error for numberOfProblems < 1');
    } catch (error) {
        assert(error.message.includes('Number of problems'), 'Should throw error about number of problems');
    }

    console.log('✓ All generateSimplifyRationalsData tests passed');
}

testGenerateSimplifyRationalsData();
