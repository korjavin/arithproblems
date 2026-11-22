import { gcd, digitalRoot, getRandomInt, getRandomFromArray } from '../utils.js';

export const MODE_SAME_DENOMINATOR = 'same-denominator';
export const MODE_SAME_NUMERATOR = 'same-numerator';
export const MODE_DIFFERENT = 'different';

// Numerator range for a given denominator: proper fractions only, or up to
// maxDen when improper fractions are allowed.
function maxNumerator(den, maxDen, allowImproper) {
    return allowImproper ? maxDen : den - 1;
}

function sameDenominator(maxDen, allowImproper) {
    const d = getRandomInt(3, maxDen);
    const hi = maxNumerator(d, maxDen, allowImproper);
    const a = getRandomInt(1, hi);
    let c = getRandomInt(1, hi - 1);
    if (c >= a) c += 1; // c ≠ a
    return [{ n: a, d }, { n: c, d }];
}

function sameNumerator(maxDen, allowImproper) {
    const b = getRandomInt(2, maxDen);
    let d = getRandomInt(2, maxDen - 1);
    if (d >= b) d += 1; // d ≠ b
    const hi = allowImproper ? maxDen : Math.min(b, d) - 1;
    const n = getRandomInt(1, hi);
    return [{ n, d: b }, { n, d }];
}

function different(maxDen, allowImproper) {
    for (let attempt = 0; attempt < 50; attempt++) {
        const b = getRandomInt(2, maxDen);
        const d = getRandomInt(2, maxDen);
        if (b === d) continue;
        const a = getRandomInt(1, maxNumerator(b, maxDen, allowImproper));
        const c = getRandomInt(1, maxNumerator(d, maxDen, allowImproper));
        if (a === c) continue;
        if (a * d === c * b) continue; // equal fractions come from equivalent()
        return [{ n: a, d: b }, { n: c, d }];
    }
    return [{ n: 1, d: 2 }, { n: 2, d: 3 }];
}

// Two different-looking forms of the same value, e.g. 2/3 and 6/9.
function equivalent(maxDen, allowImproper) {
    for (let attempt = 0; attempt < 50; attempt++) {
        const q = getRandomInt(2, Math.floor(maxDen / 2));
        const p = getRandomInt(1, allowImproper ? Math.floor(maxDen / 2) : q - 1);
        if (gcd(p, q) !== 1) continue;
        const maxK = Math.floor(maxDen / Math.max(p, q));
        if (maxK < 2) continue;
        const k1 = getRandomInt(1, maxK);
        let k2 = getRandomInt(1, maxK - 1);
        if (k2 >= k1) k2 += 1;
        const pair = [{ n: p * k1, d: q * k1 }, { n: p * k2, d: q * k2 }];
        return getRandomInt(0, 1) === 0 ? pair : pair.reverse();
    }
    return [{ n: 1, d: 2 }, { n: 2, d: 4 }];
}

function compare(left, right) {
    const l = left.n * right.d;
    const r = right.n * left.d;
    return l < r ? '<' : l > r ? '>' : '=';
}

/**
 * Self-check: reduce the larger fraction (either one if equal) to lowest terms
 * and take the digital root of numerator + denominator. The student has to
 * commit to a comparison to know which fraction to use, but the cell reveals
 * nothing about whether the answer is <, = or >.
 */
export function compareFractionsControlSum(left, right, comparison) {
    const larger = comparison === '<' ? right : left;
    const g = gcd(larger.n, larger.d);
    return digitalRoot(larger.n / g + larger.d / g);
}

/**
 * @param {Object} params
 * @param {number}  params.maxDenominator     largest denominator (and numerator when improper), 4..30
 * @param {boolean} params.includeSameDenominator  e.g. 3/7 ? 5/7
 * @param {boolean} params.includeSameNumerator    e.g. 3/5 ? 3/8
 * @param {boolean} params.includeDifferent        e.g. 2/3 ? 5/8, including equal pairs like 2/3 ? 6/9
 * @param {boolean} params.allowImproper           allow numerators larger than the denominator
 * @param {number}  params.numberOfProblems
 * @returns {{ problems: Array<{left, right, comparison}>, controlSums: Array<{controlSum}> }}
 */
export function generateCompareFractionsData({
    maxDenominator,
    includeSameDenominator = true,
    includeSameNumerator = true,
    includeDifferent = true,
    allowImproper = false,
    numberOfProblems,
}) {
    if (!Number.isFinite(maxDenominator) || maxDenominator < 4 || maxDenominator > 30) {
        throw new Error('Max denominator must be between 4 and 30.');
    }
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) {
        throw new Error('Invalid number of problems.');
    }
    const modes = [];
    if (includeSameDenominator) modes.push(MODE_SAME_DENOMINATOR);
    if (includeSameNumerator) modes.push(MODE_SAME_NUMERATOR);
    if (includeDifferent) modes.push(MODE_DIFFERENT);
    if (modes.length === 0) {
        throw new Error('At least one problem type must be enabled.');
    }

    const problems = [];
    const controlSums = [];
    for (let i = 0; i < numberOfProblems; i++) {
        const mode = getRandomFromArray(modes);
        let pair;
        if (mode === MODE_SAME_DENOMINATOR) {
            pair = sameDenominator(maxDenominator, allowImproper);
        } else if (mode === MODE_SAME_NUMERATOR) {
            pair = sameNumerator(maxDenominator, allowImproper);
        } else {
            // About a quarter of the different-looking pairs are equal in value.
            pair = getRandomInt(0, 3) === 0
                ? equivalent(maxDenominator, allowImproper)
                : different(maxDenominator, allowImproper);
        }
        const [left, right] = pair;
        const comparison = compare(left, right);
        problems.push({ left, right, comparison, mode });
        controlSums.push({ controlSum: compareFractionsControlSum(left, right, comparison) });
    }
    return { problems, controlSums };
}
