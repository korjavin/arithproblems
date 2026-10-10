import assert from 'assert';
import fs from 'fs';
import { generateNumberPropertiesData, TYPES, MAX_VALUES } from './generators/number-properties.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.number_properties]));
const gen = (types, maxValue = 1000, lang = 'en', numberOfProblems = 30) => generateNumberPropertiesData({ types, maxValue, numberOfProblems, translations: LOCALES[lang] });

// Independent helpers (string-free arithmetic).
const nums = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const digits = (n) => { const d = []; do { d.unshift(n % 10); n = Math.floor(n / 10); } while (n > 0); return d; };
const dsum = (n) => digits(n).reduce((a, b) => a + b, 0);
const dprod = (n) => digits(n).reduce((a, b) => a * b, 1);
const pal = (n) => { const d = digits(n); return d.every((x, i) => x === d[d.length - 1 - i]); };
const prime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };

assert.deepStrictEqual(nums(100, 999).filter(x => pal(x) && digits(x).includes(1)).length, 18); // 1b1 ×10 + a1a ×8
assert.strictEqual(nums(530, 566).filter(pal).length, 4); // 535 545 555 565
assert.strictEqual(nums(200, 400).filter(x => dsum(x) === 6).length, 9); // 204 213 222 231 240 303 312 321 330

const PRED = {
    remainder: ({ a, r }, x) => x % a === r && r > 0 && r < a,
    divisible: ({ a }, x) => x % a === 0,
    pred_divisible: ({ k }, x) => (x - 1) % k === 0,
    succ_divisible: ({ k }, x) => (x + 1) % k === 0,
    even: (_, x) => x % 2 === 0,
    odd: (_, x) => x % 2 === 1,
    between: ({ lo, hi }, x) => lo < x && x < hi,
    less_than: ({ m }, x) => x < m,
    digit_sum: ({ s }, x) => dsum(x) === s,
    digit_product: ({ p }, x) => dprod(x) === p,
    tens_times_ones: ({ k }, x) => x % 10 > 0 && Math.floor(x / 10) % 10 === k * (x % 10),
    increasing: (_, x) => digits(x).every((d, i, ds) => i === 0 || d > ds[i - 1]),
    first_last: (_, x) => digits(x)[0] === x % 10,
};

function expected(p, maxValue) {
    const d = p.data;
    if (p.conditions) {
        assert(p.conditions.length >= 3 && p.conditions.length <= 4, `${p.variant}: ${p.conditions.length} conditions`);
        const universe = p.variant === 'remainder' ? nums(1, maxValue - 1) : p.variant === 'digits_2' ? nums(10, 99) : nums(100, 999);
        if (p.variant === 'remainder') {
            assert.strictEqual(d.max, maxValue);
            assert(['remainder', 'divisible'].includes(p.conditions[0].key) && p.conditions[0].data.a >= 3 && p.conditions[0].data.a <= 9);
        }
        const hits = universe.filter(x => p.conditions.every(c => PRED[c.key](c.data, x)));
        assert.strictEqual(hits.length, 1, `unique ${p.variant} ${JSON.stringify(p.conditions)}`);
        return hits[0];
    }
    switch (p.variant) {
        case 'count_digit_sum': return nums(d.a, d.b).filter(x => dsum(x) === d.s).length;
        case 'count_palindromes_digit': return nums(100, 999).filter(x => pal(x) && digits(x).includes(d.d)).length;
        case 'count_palindromes_range': return nums(d.a, d.b).filter(pal).length;
        case 'consecutive': case 'consecutive_step': {
            assert(d.k >= 2 && d.k <= 5);
            assert(p.variant === 'consecutive' ? d.d === 1 : d.d >= 2 && d.d <= 5);
            const hits = nums(1, d.s).filter(x => nums(0, d.k - 1).reduce((s, i) => s + x + i * d.d, 0) === d.s);
            assert.strictEqual(hits.length, 1);
            return hits[0];
        }
        case 'smallest_sum': return nums(100, 999).find(x => dsum(x) === d.s);
        case 'largest_sum': return nums(100, 999).reverse().find(x => dsum(x) === d.s);
        case 'largest_less': return nums(100, 999).reverse().find(x => dsum(x) < d.s);
        case 'distinct_digit_sum': {
            assert(d.k >= 2 && d.k <= 5);
            return Math.max(...nums(10 ** (d.k - 1), 10 ** d.k - 1).filter(x => new Set(digits(x)).size === d.k).map(dsum));
        }
        case 'next_palindrome': assert(pal(d.p) && d.p >= 100 && d.p < 999); return nums(d.p + 1, 1001).find(pal);
        case 'prime_sum': return nums(2, d.n / 2).filter(q => prime(q) && prime(d.n - q)).length;
        case 'prime_count': return nums(d.a + 1, d.b - 1).filter(prime).length;
        default: throw new Error(`unknown variant ${p.variant}`);
    }
}

// distinct_digit_sum brute force is slow for k = 5: memoise by key.
const memo = new Map();
const check = (p, maxValue) => {
    const key = p.conditions ? null : `${p.variant}${JSON.stringify(p.data)}`;
    if (key && memo.has(key)) return memo.get(key);
    const v = expected(p, maxValue);
    if (key) memo.set(key, v);
    return v;
};

const seen = new Set();
for (const lang of ['en', 'de', 'ru']) {
    const t = LOCALES[lang];
    for (const maxValue of MAX_VALUES) {
        for (const type of TYPES) {
            for (let run = 0; run < 4; run++) {
                const { problems, controlSums } = gen([type], maxValue, lang);
                assert.strictEqual(problems.length, 30);
                problems.forEach((p, i) => {
                    seen.add(p.variant);
                    assert.strictEqual(p.type, type);
                    assert.strictEqual(check(p, maxValue), p.answer, `${p.variant} ${JSON.stringify(p.data)}`);
                    if (p.mode === 'all') {
                        assert.strictEqual(p.variant, 'prime_sum');
                        assert(p.answer >= 2 && p.answer <= 9);
                        assert.strictEqual(p.controlSum, p.answer);
                    } else {
                        assert.strictEqual(p.controlSum, digitalRoot(p.answer));
                    }
                    assert(p.controlSum >= 0 && p.controlSum <= 9);
                    assert.strictEqual(controlSums[i].controlSum, p.controlSum);
                    assert(!/{\w+}|undefined|NaN/.test(p.text), `unfilled template: ${p.text}`);
                });
            }
        }
    }
}
['remainder', 'digits_2', 'digits_3', 'count_digit_sum', 'count_palindromes_digit', 'count_palindromes_range', 'consecutive', 'consecutive_step',
    'smallest_sum', 'largest_sum', 'largest_less', 'distinct_digit_sum', 'next_palindrome', 'prime_sum', 'prime_count'].forEach(v => assert(seen.has(v), `variant ${v} generated`));

// Hint flags follow the terms used on the sheet.
const sheet = gen(TYPES, 1000, 'de').problems;
sheet.forEach(p => {
    if (p.conditions && p.conditions.some(c => c.key.startsWith('digit_'))) assert(p.digitTerms);
    assert.strictEqual(p.palindromeTerms, p.variant.includes('palindrome'));
});

assert.strictEqual(gen(TYPES, 400, 'en', 12).problems.length, 12);
assert.strictEqual(gen(TYPES, 400, 'en', 100).problems.length, 30);

assert.throws(() => gen([]));
assert.throws(() => gen(['nope']));
assert.throws(() => gen(TYPES, 500));
assert.throws(() => gen(TYPES, 1000, 'en', 0));
assert.throws(() => gen(TYPES, 1000, 'en', NaN));

const keys = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`])).sort();
assert.deepStrictEqual(keys(LOCALES.de), keys(LOCALES.en));
assert.deepStrictEqual(keys(LOCALES.ru), keys(LOCALES.en));

console.log('All number-properties tests passed!');
