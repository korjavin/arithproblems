import assert from 'assert';
import { gcd, digitalRoot, getRandomInt, getRandomNumberByDigits, getRandomFromArray, shuffleArray } from './utils.js';

function testGcd() {
    assert.strictEqual(gcd(48, 18), 6, 'Test Case 1 Failed: gcd(48, 18)');
    assert.strictEqual(gcd(101, 103), 1, 'Test Case 2 Failed: gcd(101, 103)');
    assert.strictEqual(gcd(10, 5), 5, 'Test Case 3 Failed: gcd(10, 5)');
    assert.strictEqual(gcd(5, 10), 5, 'Test Case 4 Failed: gcd(5, 10)');
    assert.strictEqual(gcd(10, 0), 10, 'Test Case 5 Failed: gcd(10, 0)');
    assert.strictEqual(gcd(0, 5), 5, 'Test Case 6 Failed: gcd(0, 5)');
    assert.strictEqual(gcd(0, 0), 0, 'Test Case 7 Failed: gcd(0, 0)');
    assert.strictEqual(gcd(-48, 18), 6, 'Test Case 8 Failed: gcd(-48, 18)');
    assert.strictEqual(gcd(48, -18), 6, 'Test Case 9 Failed: gcd(48, -18)');
    assert.strictEqual(gcd(-48, -18), 6, 'Test Case 10 Failed: gcd(-48, -18)');
    assert.strictEqual(gcd(0, -5), 5, 'Test Case 11 Failed: gcd(0, -5)');
    assert.strictEqual(gcd(-10, 0), 10, 'Test Case 12 Failed: gcd(-10, 0)');
    assert.strictEqual(gcd(-0, 0), 0, 'Test Case 13 Failed: gcd(-0, 0)');
    assert.strictEqual(gcd(0, -0), 0, 'Test Case 14 Failed: gcd(0, -0)');
    assert.strictEqual(gcd(-0, -0), 0, 'Test Case 15 Failed: gcd(-0, -0)');
    console.log('All gcd tests passed!');
}

function testDigitalRoot() {
    assert.strictEqual(digitalRoot(123), 6, 'Test Case 1 Failed: digitalRoot(123)');
    assert.strictEqual(digitalRoot(99), 9, 'Test Case 2 Failed: digitalRoot(99)');
    assert.strictEqual(digitalRoot(493193), 2, 'Test Case 3 Failed: digitalRoot(493193)');
    assert.strictEqual(digitalRoot(5), 5, 'Test Case 4 Failed: digitalRoot(5)');
    assert.strictEqual(digitalRoot(0), 0, 'Test Case 5 Failed: digitalRoot(0)');
    assert.strictEqual(digitalRoot(-123), 6, 'Test Case 6 Failed: digitalRoot(-123)');
    assert.strictEqual(digitalRoot(-99), 9, 'Test Case 7 Failed: digitalRoot(-99)');

    // Additional Edge Cases
    assert.strictEqual(digitalRoot(-5), 5, 'Test Case 8 Failed: digitalRoot(-5)');
    assert.strictEqual(digitalRoot(-0), 0, 'Test Case 9 Failed: digitalRoot(-0)');
    assert.strictEqual(digitalRoot(10), 1, 'Test Case 10 Failed: digitalRoot(10)');
    assert.strictEqual(digitalRoot(-10), 1, 'Test Case 11 Failed: digitalRoot(-10)');
    assert.strictEqual(digitalRoot("123"), 6, 'Test Case 12 Failed: digitalRoot("123")');
    assert.strictEqual(digitalRoot("-123"), 6, 'Test Case 13 Failed: digitalRoot("-123")');
    assert.strictEqual(digitalRoot(1000000000), 1, 'Test Case 14 Failed: digitalRoot(1000000000)');
    assert.strictEqual(digitalRoot(-1000000000), 1, 'Test Case 15 Failed: digitalRoot(-1000000000)');

    console.log('All digitalRoot tests passed!');
}

function testRandomInt() {
    for (let i = 0; i < 100; i++) {
        const val = getRandomInt(1, 10);
        assert(val >= 1 && val <= 10, `getRandomInt(1, 10) returned ${val}`);
    }
    for (let i = 0; i < 100; i++) {
        const val = getRandomInt(-5, 5);
        assert(val >= -5 && val <= 5, `getRandomInt(-5, 5) returned ${val}`);
    }
    assert.strictEqual(getRandomInt(5, 5), 5, 'getRandomInt(5, 5) should be 5');

    // Fractional inputs
    for (let i = 0; i < 100; i++) {
        const val = getRandomInt(4.5, 15.8);
        assert(Number.isInteger(val), `getRandomInt(4.5, 15.8) returned non-integer ${val}`);
        assert(val >= 4 && val <= 15, `getRandomInt(4.5, 15.8) returned out-of-bounds ${val}`);
    }

    console.log('All getRandomInt tests passed!');
}

function testGetRandomNumberByDigits() {
    for (let i = 0; i < 100; i++) {
        const val = getRandomNumberByDigits(1, true);
        assert(val >= 1 && val <= 9, `getRandomNumberByDigits(1, true) returned ${val}`);
    }
    let zeroFound = false;
    for (let i = 0; i < 200; i++) {
        const val = getRandomNumberByDigits(1, false);
        assert(val >= 0 && val <= 9, `getRandomNumberByDigits(1, false) returned ${val}`);
        if (val === 0) zeroFound = true;
    }
    assert(zeroFound, 'getRandomNumberByDigits(1, false) should eventually return 0');
    for (let i = 0; i < 100; i++) {
        const val = getRandomNumberByDigits(3);
        assert(val >= 100 && val <= 999, `getRandomNumberByDigits(3) returned ${val}`);
    }

    // Edge cases
    assert.strictEqual(getRandomNumberByDigits(-1, true), 1, 'getRandomNumberByDigits(-1, true) should be 1');
    assert.strictEqual(getRandomNumberByDigits(-1, false), 0, 'getRandomNumberByDigits(-1, false) should be 0');
    assert.strictEqual(getRandomNumberByDigits(0, true), 1, 'getRandomNumberByDigits(0, true) should be 1');
    assert.strictEqual(getRandomNumberByDigits(0, false), 0, 'getRandomNumberByDigits(0, false) should be 0');

    console.log('All getRandomNumberByDigits tests passed!');
}

function testGetRandomFromArray() {
    const arr = [1, 2, 3, 4, 5];
    for (let i = 0; i < 100; i++) {
        const val = getRandomFromArray(arr);
        assert(arr.includes(val), `getRandomFromArray([1,2,3,4,5]) returned ${val}`);
    }
    assert.strictEqual(getRandomFromArray([]), undefined, 'getRandomFromArray([]) should return undefined');
    console.log('All getRandomFromArray tests passed!');
}

function testShuffleArray() {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    assert.strictEqual(shuffled.length, arr.length, 'Shuffled array should have same length');
    assert(shuffled.every(x => arr.includes(x)), 'Shuffled array should have same elements');
    // Not strictly true that it must be different, but for [1,2,3,4,5] it's very likely.
    // We won't assert it's different to avoid flaky tests.
    console.log('All shuffleArray tests passed!');
}

try {
    testGcd();
    testDigitalRoot();
    testRandomInt();
    testGetRandomNumberByDigits();
    testGetRandomFromArray();
    testShuffleArray();
    console.log('All tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
