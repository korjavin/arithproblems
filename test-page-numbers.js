import assert from 'assert';
import fs from 'fs';
import { generatePageNumbersData, TYPES, MAX_PAGES } from './generators/page-numbers.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.page_numbers]));
const gen = (types, maxPages = 250, lang = 'en', numberOfProblems = 30) => generatePageNumbersData({ types, maxPages, numberOfProblems, translations: LOCALES[lang] });

// Independent oracle: literally write 1..N in a row and scan it.
const book = (n) => { let s = ''; for (let i = 1; i <= n; i++) s += i; return s; };
const triples = (s) => { let c = 0; for (let i = 0; i + 2 < s.length; i++) if (s[i] === s[i + 1] && s[i] === s[i + 2]) c++; return c; };
const longestRun = (s) => { let best = 1, run = 1; for (let i = 1; i < s.length; i++) { run = s[i] === s[i - 1] ? run + 1 : 1; best = Math.max(best, run); } return best; };

assert.strictEqual(book(100).length, 192);
assert.strictEqual(book(250).length, 642);
assert.strictEqual(book(20)[19], '1'); // 1234567891011121314… → 15th..: 20th digit is 1 of "15"
assert.strictEqual(triples(book(20)), 1); // "101112" → 111
assert.strictEqual(longestRun(book(110)), 3);
assert.ok(longestRun(book(111)) > 3);

function check(p, maxPages) {
    const { n, d, k, digits } = p.data;
    switch (p.variant) {
        case 'digit_count':
            assert.ok(n >= 10 && n <= Math.min(250, maxPages));
            assert.strictEqual(p.answer, book(n).length); break;
        case 'digit_count_inverse':
            assert.ok(p.answer >= 10 && p.answer <= Math.min(250, maxPages));
            assert.strictEqual(book(p.answer).length, digits); break;
        case 'kth_digit':
            assert.ok(k >= 10 && k <= 120 && k <= book(maxPages).length);
            assert.strictEqual(p.answer, Number(book(200)[k - 1]));
            assert.strictEqual(p.controlSum, p.answer); break;
        case 'occurrences':
            assert.ok(n >= 20 && n <= Math.min(120, maxPages) && d >= 0 && d <= 9);
            assert.strictEqual(p.answer, book(n).split('').filter(c => c === String(d)).length); break;
        case 'sum':
            assert.ok(k >= 10 && k <= 30);
            assert.strictEqual(p.answer, Array.from({ length: k }, (_, i) => i + 1).reduce((a, b) => a + b, 0)); break;
        case 'triples':
            assert.ok(n >= 20 && n <= Math.min(110, maxPages));
            assert.ok(longestRun(book(n)) <= 3);
            assert.strictEqual(p.answer, triples(book(n))); break;
        default: assert.fail(`unknown variant ${p.variant}`);
    }
    assert.strictEqual(p.controlSum, digitalRoot(p.answer));
    assert.ok(p.controlSum >= 0 && p.controlSum <= 9);
}

for (const lang of ['en', 'de', 'ru']) {
    for (const maxPages of MAX_PAGES) {
        for (let round = 0; round < 20; round++) {
            const { problems, controlSums } = gen(TYPES, maxPages, lang);
            assert.strictEqual(problems.length, 30);
            assert.strictEqual(controlSums.length, 30);
            problems.forEach((p, i) => {
                check(p, maxPages);
                assert.strictEqual(controlSums[i].controlSum, p.controlSum);
                assert.ok(p.text && !/[{}]/.test(p.text), `unfilled template: ${p.text}`);
            });
        }
    }
}

// Every type alone, both digit-count directions, zero digit reachable.
const seen = new Set();
for (const type of TYPES) {
    for (let i = 0; i < 10; i++) gen([type], 120).problems.forEach(p => { assert.strictEqual(p.type, type); seen.add(p.variant); });
}
for (const v of ['digit_count', 'digit_count_inverse', 'kth_digit', 'occurrences', 'sum', 'triples']) assert.ok(seen.has(v), `variant ${v} never generated`);
const kthDigits = new Set();
for (let i = 0; i < 50; i++) gen(['kth_digit'], 250).problems.forEach(p => kthDigits.add(p.answer));
assert.ok(kthDigits.has(0), 'digit 0 should appear as a k-th digit answer');

assert.strictEqual(gen(TYPES, 50, 'en', 5).problems.length, 5);
assert.throws(() => gen([]));
assert.throws(() => gen(TYPES, 77));
assert.throws(() => gen(TYPES, 50, 'en', 0));

console.log('test-page-numbers: all tests passed');
