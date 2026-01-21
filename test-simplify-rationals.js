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
            assert(problem.numerator, `Problem ${i} should have a numerator property`);
            assert(problem.denominator, `Problem ${i} should have a denominator property`);
            assert(typeof problem.numerator === 'string', `Problem ${i} numerator should be a string`);
            assert(typeof problem.denominator === 'string', `Problem ${i} denominator should be a string`);
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
