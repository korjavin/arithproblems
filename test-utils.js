import assert from 'assert';
import { gcd, digitalRoot } from './utils.js';

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
    console.log('All digitalRoot tests passed!');
}

try {
    testGcd();
    testDigitalRoot();
    console.log('All tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}