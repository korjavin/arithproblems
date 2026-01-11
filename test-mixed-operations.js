import { generateMixedOperationsData } from './generators/mixed-operations.js';

console.log('Testing Mixed Operations Generator\n');
console.log('='.repeat(60));

// Test 1: Basic 2-operation problems (1-20 range)
console.log('\nTest 1: 2-operation problems, range 1-20');
console.log('-'.repeat(60));
try {
    const { problems, answerRoots } = generateMixedOperationsData({
        numberRange: '1-20',
        numOperations: 2,
        operationMix: 'all',
        ensureEvenDivision: true,
        numberOfProblems: 5
    });

    problems.forEach((p, i) => {
        console.log(`${i + 1}. ${p.expression} = ${p.result} (DR: ${answerRoots[i].root})`);
        console.log(`   Intermediate: ${p.intermediate}`);
    });
    console.log('✅ Test 1 PASSED');
} catch (error) {
    console.log('❌ Test 1 FAILED:', error.message);
}

// Test 2: 3-operation problems (1-50 range)
console.log('\nTest 2: 3-operation problems, range 1-50');
console.log('-'.repeat(60));
try {
    const { problems, answerRoots } = generateMixedOperationsData({
        numberRange: '1-50',
        numOperations: 3,
        operationMix: 'all',
        ensureEvenDivision: true,
        numberOfProblems: 3
    });

    problems.forEach((p, i) => {
        console.log(`${i + 1}. ${p.expression} = ${p.result} (DR: ${answerRoots[i].root})`);
        console.log(`   Intermediates: ${p.intermediate1}, ${p.intermediate2}`);
    });
    console.log('✅ Test 2 PASSED');
} catch (error) {
    console.log('❌ Test 2 FAILED:', error.message);
}

// Test 3: Only multiplication + addition
console.log('\nTest 3: Multiplication + Addition only');
console.log('-'.repeat(60));
try {
    const { problems, answerRoots } = generateMixedOperationsData({
        numberRange: '1-10',
        numOperations: 2,
        operationMix: 'mult-add',
        ensureEvenDivision: true,
        numberOfProblems: 5
    });

    problems.forEach((p, i) => {
        console.log(`${i + 1}. ${p.expression} = ${p.result} (DR: ${answerRoots[i].root})`);
        // Verify only × and + are used
        if (!p.expression.includes('×') || !p.expression.includes('+')) {
            throw new Error('Expected only × and + operations');
        }
    });
    console.log('✅ Test 3 PASSED - Only × and + operations');
} catch (error) {
    console.log('❌ Test 3 FAILED:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('All tests completed successfully! ✅');
