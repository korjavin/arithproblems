import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

// Number-property olympiad riddles: remainders, digit riddles, counting,
// consecutive numbers, extremes and primes. Riddles are unique by brute force
// over their universe; the self-check digit is digitalRoot(answer), except
// "all ways" problems whose digit is the number of ways (1–9).
export const TYPES = ['remainder', 'digits', 'count', 'consecutive', 'extremes', 'primes'];
export const MAX_VALUES = [100, 400, 1000];
const MAX_TRIES = 500;

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
export const digitsOf = (n) => String(n).split('').map(Number);
export const digitSum = (n) => digitsOf(n).reduce((a, b) => a + b, 0);
export const digitProduct = (n) => digitsOf(n).reduce((a, b) => a * b, 1);
export const isPalindrome = (n) => String(n) === String(n).split('').reverse().join('');
export const isPrime = (n) => n >= 2 && range(2, Math.floor(Math.sqrt(n))).every(d => n % d !== 0);
// Ways to write n as p + q with primes p ≤ q.
export const primeSums = (n) => range(2, Math.floor(n / 2)).filter(p => isPrime(p) && isPrime(n - p)).map(p => [p, n - p]);

// Condition key → predicate. Every key has a cond_<key> template.
export const CHECKS = {
    remainder: ({ a, r }) => x => x % a === r,
    divisible: ({ a }) => x => x % a === 0,
    pred_divisible: ({ k }) => x => (x - 1) % k === 0,
    succ_divisible: ({ k }) => x => (x + 1) % k === 0,
    even: () => x => x % 2 === 0,
    odd: () => x => x % 2 === 1,
    between: ({ lo, hi }) => x => x > lo && x < hi,
    less_than: ({ m }) => x => x < m,
    digit_sum: ({ s }) => x => digitSum(x) === s,
    digit_product: ({ p }) => x => digitProduct(x) === p,
    tens_times_ones: ({ k }) => x => x % 10 !== 0 && Math.floor(x / 10) % 10 === k * (x % 10),
    increasing: () => x => digitsOf(x).every((d, i, ds) => i === 0 || d > ds[i - 1]),
    first_last: () => x => digitsOf(x)[0] === x % 10,
};
const cond = (key, data = {}) => ({ key, data });
const holds = (c, x) => CHECKS[c.key](c.data)(x);

// Greedily picks conditions (first one fixed) that narrow the universe until one
// number is left, then pads to at least three. null when 4 conditions don't suffice.
function pickConditions(universe, first, rest) {
    const chosen = [];
    let left = universe;
    const unused = [];
    for (const c of [first, ...shuffleArray(rest)]) {
        const next = left.filter(x => holds(c, x));
        if (left.length > 1 && (next.length < left.length || c === first)) { chosen.push(c); left = next; } else unused.push(c);
    }
    if (left.length !== 1 || chosen.length > 4) return null;
    while (chosen.length < 3 && unused.length) chosen.push(unused.shift());
    return chosen.length >= 3 ? chosen : null;
}

function modConditions(n, moduli) {
    return moduli.map(a => (n % a === 0 ? cond('divisible', { a }) : cond('remainder', { a, r: n % a })));
}

function neighbourCondition(n, key, used) {
    const ks = range(2, 9).filter(k => !used.includes(k) && (key === 'pred_divisible' ? n - 1 : n + 1) % k === 0);
    return ks.length ? [cond(key, { k: getRandomFromArray(ks) })] : [];
}

const MAKERS = {
    remainder(maxValue) {
        for (let tries = 0; tries < MAX_TRIES; tries++) {
            const n = getRandomInt(10, maxValue - 1);
            const moduli = shuffleArray(range(3, 9)).slice(0, 3);
            const [first, ...mods] = modConditions(n, moduli);
            const w = Math.max(10, maxValue / 5);
            const lo = Math.max(1, n - getRandomInt(1, w - 1));
            const rest = [...mods,
                ...neighbourCondition(n, 'pred_divisible', moduli), ...neighbourCondition(n, 'succ_divisible', moduli),
                cond(n % 2 ? 'odd' : 'even'), cond('between', { lo, hi: Math.min(maxValue, lo + w) }), cond('digit_sum', { s: digitSum(n) })];
            const conditions = pickConditions(range(1, maxValue - 1), first, rest);
            if (conditions) return { variant: 'remainder', data: { max: maxValue }, conditions, answer: n };
        }
        throw new Error('No remainder riddle found.');
    },

    digits() {
        for (let tries = 0; tries < MAX_TRIES; tries++) {
            const len = getRandomInt(2, 3);
            const universe = len === 2 ? range(10, 99) : range(100, 999);
            const n = getRandomFromArray(universe);
            const ds = digitsOf(n);
            const first = getRandomInt(0, 1) ? cond('digit_sum', { s: digitSum(n) }) : cond('digit_product', { p: digitProduct(n) });
            const rest = [first.key === 'digit_sum' ? cond('digit_product', { p: digitProduct(n) }) : cond('digit_sum', { s: digitSum(n) }),
                cond(n % 2 ? 'odd' : 'even'), cond('less_than', { m: Math.min(universe[universe.length - 1] + 1, n + getRandomInt(1, 30)) })];
            if (n % 5 === 0) rest.push(cond('divisible', { a: 5 }));
            if (n % 3 === 0) rest.push(cond('divisible', { a: 3 }));
            if (len === 2 && ds[1] && ds[0] % ds[1] === 0 && ds[0] / ds[1] >= 2) rest.push(cond('tens_times_ones', { k: ds[0] / ds[1] }));
            if (CHECKS.increasing()(n)) rest.push(cond('increasing'));
            if (len === 3 && ds[0] === ds[2]) rest.push(cond('first_last'));
            const conditions = pickConditions(universe, first, rest);
            if (conditions) return { variant: `digits_${len}`, data: {}, conditions, answer: n };
        }
        throw new Error('No digit riddle found.');
    },

    count() {
        const variant = getRandomFromArray(['count_digit_sum', 'count_palindromes_digit', 'count_palindromes_range']);
        if (variant === 'count_palindromes_digit') {
            const d = getRandomInt(0, 9);
            return { variant, data: { d }, answer: range(100, 999).filter(x => isPalindrome(x) && digitsOf(x).includes(d)).length };
        }
        for (let tries = 0; tries < MAX_TRIES; tries++) {
            if (variant === 'count_digit_sum') {
                const a = 100 * getRandomInt(1, 8), b = a + 100 * getRandomInt(1, 2), s = getRandomInt(3, 20);
                const answer = range(a, b).filter(x => digitSum(x) === s).length;
                if (answer >= 1) return { variant, data: { a, b, s }, answer };
            } else {
                const a = getRandomInt(100, 900), b = Math.min(999, a + getRandomInt(30, 150));
                const answer = range(a, b).filter(isPalindrome).length;
                if (answer >= 1) return { variant, data: { a, b }, answer };
            }
        }
        throw new Error('No counting problem found.');
    },

    consecutive() {
        const k = getRandomInt(2, 5), x = getRandomInt(1, 50);
        const d = getRandomInt(0, 1) ? 1 : getRandomInt(2, 5);
        const s = k * x + d * k * (k - 1) / 2;
        return { variant: d === 1 ? 'consecutive' : 'consecutive_step', data: { k, d, s }, answer: x };
    },

    extremes() {
        const variant = getRandomFromArray(['smallest_sum', 'largest_sum', 'largest_less', 'distinct_digit_sum', 'next_palindrome']);
        if (variant === 'distinct_digit_sum') {
            const k = getRandomInt(2, 5);
            return { variant, data: { k }, answer: range(10 - k, 9).reduce((a, b) => a + b, 0) }; // 9 + 8 + … (k digits)
        }
        if (variant === 'next_palindrome') {
            const p = getRandomFromArray(range(101, 989).filter(isPalindrome));
            let q = p + 1;
            while (!isPalindrome(q)) q++;
            return { variant, data: { p }, answer: q };
        }
        const s = variant === 'largest_less' ? getRandomInt(3, 27) : getRandomInt(2, 26);
        const fits = variant === 'largest_less' ? x => digitSum(x) < s : x => digitSum(x) === s;
        const all = range(100, 999).filter(fits);
        return { variant, data: { s }, answer: variant === 'smallest_sum' ? all[0] : all[all.length - 1] };
    },

    primes() {
        if (getRandomInt(0, 1)) {
            const n = getRandomFromArray(range(5, 50).map(x => 2 * x).filter(x => primeSums(x).length >= 2 && primeSums(x).length <= 9));
            return { variant: 'prime_sum', mode: 'all', data: { n }, answer: primeSums(n).length };
        }
        const a = getRandomInt(1, 70), b = a + getRandomInt(10, 30);
        return { variant: 'prime_count', data: { a, b }, answer: range(a + 1, b - 1).filter(isPrime).length };
    },
};

// Conditions that need the digit-sum / digit-product hint line on the sheet.
const DIGIT_TERMS = ['digit_sum', 'digit_product'];

function render(p, t) {
    const intro = fillTemplate(t.templates[p.variant], p.data);
    if (!p.conditions) return intro;
    return `${intro}${p.conditions.map(c => `<br>– ${fillTemplate(t.templates[`cond_${c.key}`], c.data)}`).join('')}`;
}

export function generateNumberPropertiesData({ types, maxValue, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!MAX_VALUES.includes(maxValue)) throw new Error('Invalid maximum value.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: prose sheet; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, mode: 'unique', ...MAKERS[type](maxValue) };
        p.text = render(p, t);
        p.digitTerms = (p.conditions || []).some(c => DIGIT_TERMS.includes(c.key)) || ['count_digit_sum', 'smallest_sum', 'largest_sum', 'largest_less', 'distinct_digit_sum'].includes(p.variant);
        p.palindromeTerms = /palindrome/.test(p.variant);
        p.controlSum =p.mode === 'all' ? p.answer : digitalRoot(p.answer);
        problems.push(p);
    }
    const shuffled = shuffleArray(problems);
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
