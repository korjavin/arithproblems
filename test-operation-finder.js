import { generateOperationFinderData } from './generators/operation-finder.js';

console.log('Testing Operation Finder Generator');
console.log('==================================\n');

// Test 1: Basic 3-number problem with all operations
console.log('Test 1: 3 numbers, range 1-20, all operations');
try {
    const result1 = generateOperationFinderData({
        numberCount: 3,
        numberRange: '1-20',
        allowedOperations: ['+', '-', '×', '÷'],
        numberOfProblems: 5
    });

    result1.problems.forEach((p, i) => {
        console.log(`  Problem ${i + 1}: ${p.expression} = ${p.result}`);
        console.log(`    Numbers: [${p.numbers.join(', ')}]`);
        console.log(`    Solution: [${p.operations.join(', ')}]`);
    });
    console.log('✓ Test 1 passed\n');
} catch (error) {
    console.log(`✗ Test 1 failed: ${error.message}\n`);
}

// Test 2: 4 numbers with only addition and multiplication
console.log('Test 2: 4 numbers, range 1-10, only + and ×');
try {
    const result2 = generateOperationFinderData({
        numberCount: 4,
        numberRange: '1-10',
        allowedOperations: ['+', '×'],
        numberOfProblems: 3
    });

    result2.problems.forEach((p, i) => {
        console.log(`  Problem ${i + 1}: ${p.expression} = ${p.result}`);
        console.log(`    Solution: [${p.operations.join(', ')}]`);
    });
    console.log('✓ Test 2 passed\n');
} catch (error) {
    console.log(`✗ Test 2 failed: ${error.message}\n`);
}

// Test 3: 5 numbers with larger range
console.log('Test 3: 5 numbers, range 1-50');
try {
    const result3 = generateOperationFinderData({
        numberCount: 5,
        numberRange: '1-50',
        allowedOperations: ['+', '-', '×', '÷'],
        numberOfProblems: 3
    });

    result3.problems.forEach((p, i) => {
        console.log(`  Problem ${i + 1}: ${p.expression} = ${p.result}`);
    });
    console.log('✓ Test 3 passed\n');
} catch (error) {
    console.log(`✗ Test 3 failed: ${error.message}\n`);
}

// Test 4: Error handling - invalid number count
console.log('Test 4: Error handling - invalid number count');
try {
    generateOperationFinderData({
        numberCount: 2, // Should fail (min is 3)
        numberRange: '1-20',
        allowedOperations: ['+'],
        numberOfProblems: 1
    });
    console.log('✗ Test 4 failed: Should have thrown an error\n');
} catch (error) {
    console.log(`✓ Test 4 passed: ${error.message}\n`);
}

// Test 5: Error handling - invalid range
console.log('Test 5: Error handling - invalid range');
try {
    generateOperationFinderData({
        numberCount: 3,
        numberRange: '1-999', // Invalid range
        allowedOperations: ['+'],
        numberOfProblems: 1
    });
    console.log('✗ Test 5 failed: Should have thrown an error\n');
} catch (error) {
    console.log(`✓ Test 5 passed: ${error.message}\n`);
}

// Test 6: Verify operation precedence
console.log('Test 6: Verify operation precedence');
try {
    const result6 = generateOperationFinderData({
        numberCount: 3,
        numberRange: '1-10',
        allowedOperations: ['+', '×'],
        numberOfProblems: 10
    });

    // Manually verify a few problems
    let allCorrect = true;
    result6.problems.forEach((p, i) => {
        // Recreate the expression with operations
        const expr = p.numbers[0] + ' ' + p.operations[0] + ' ' + p.numbers[1] + ' ' + p.operations[1] + ' ' + p.numbers[2];

        // Evaluate manually respecting precedence
        let expected;
        if (p.operations[0] === '×') {
            expected = p.numbers[0] * p.numbers[1];
            expected = p.operations[1] === '+' ? expected + p.numbers[2] : expected - p.numbers[2];
        } else if (p.operations[1] === '×') {
            const intermediate = p.numbers[1] * p.numbers[2];
            expected = p.operations[0] === '+' ? p.numbers[0] + intermediate : p.numbers[0] - intermediate;
        } else {
            // Both are + or -
            expected = p.operations[0] === '+' ? p.numbers[0] + p.numbers[1] : p.numbers[0] - p.numbers[1];
            expected = p.operations[1] === '+' ? expected + p.numbers[2] : expected - p.numbers[2];
        }

        if (expected !== p.result) {
            console.log(`  ✗ Problem ${i + 1} incorrect: ${expr} should be ${expected}, got ${p.result}`);
            allCorrect = false;
        }
    });

    if (allCorrect) {
        console.log('✓ Test 6 passed: All problems have correct results\n');
    } else {
        console.log('✗ Test 6 failed: Some problems have incorrect results\n');
    }
} catch (error) {
    console.log(`✗ Test 6 failed: ${error.message}\n`);
}

console.log('==================================');
console.log('Testing complete!');
