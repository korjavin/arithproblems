import { digitalRoot as newDigitalRoot } from './utils.js';

// Inefficient version for benchmarking baseline
function oldDigitalRoot(n) {
    let num = Math.abs(n);
    let sum = num;
    while (sum >= 10) {
        sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum;
}

const N = 10000000;
const testCases = [123, 99, 493193, 5, 0, -123, -99, 123456789, 987654321];

console.log('Testing correctness...');
for (let tc of testCases) {
    if (oldDigitalRoot(tc) !== newDigitalRoot(tc)) {
        console.error(`Mismatch for ${tc}: old=${oldDigitalRoot(tc)}, new=${newDigitalRoot(tc)}`);
        process.exit(1);
    }
}
console.log('Correctness verified.\n');

console.log('Running benchmark...');
const startOld = process.hrtime.bigint();
let sumOld = 0;
for (let i = 0; i < N; i++) {
    sumOld += oldDigitalRoot(testCases[i % testCases.length]);
}
const endOld = process.hrtime.bigint();
const timeOldMs = Number(endOld - startOld) / 1000000;

const startNew = process.hrtime.bigint();
let sumNew = 0;
for (let i = 0; i < N; i++) {
    sumNew += newDigitalRoot(testCases[i % testCases.length]);
}
const endNew = process.hrtime.bigint();
const timeNewMs = Number(endNew - startNew) / 1000000;

console.log(`Old digitalRoot: ${timeOldMs.toFixed(2)} ms (sum=${sumOld})`);
console.log(`New digitalRoot: ${timeNewMs.toFixed(2)} ms (sum=${sumNew})`);
console.log(`Speedup: ${(timeOldMs / timeNewMs).toFixed(2)}x`);
