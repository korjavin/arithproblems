import { digitalRoot, getRandomInt, shuffleArray, fillTemplate } from '../utils.js';

// Page numbering problems: digits used to number N pages, the k-th digit of
// 123456789101112…, how often a digit occurs, sums of page numbers and runs of
// three equal digits. Answers are computed by scanning the string 1..N.
export const TYPES = ['digit_count', 'kth_digit', 'occurrences', 'sum', 'triples'];
export const MAX_PAGES = [50, 120, 250];

export const pageString = (n) => Array.from({ length: n }, (_, i) => i + 1).join('');
// Positions i where s[i] = s[i+1] = s[i+2].
export const countTriples = (s) => [...s].filter((c, i) => c === s[i + 1] && c === s[i + 2]).length;
const longestRun = (s) => Math.max(...s.match(/(.)\1*/g).map(r => r.length));

const MAKERS = {
    digit_count(maxPages) {
        const n = getRandomInt(10, maxPages);
        const digits = pageString(n).length;
        return getRandomInt(0, 1)
            ? { variant: 'digit_count', data: { n }, answer: digits }
            : { variant: 'digit_count_inverse', data: { digits }, answer: n };
    },
    kth_digit(maxPages) {
        const k = getRandomInt(10, Math.min(120, pageString(maxPages).length));
        return { variant: 'kth_digit', data: { k }, answer: Number(pageString(maxPages)[k - 1]) };
    },
    occurrences(maxPages) {
        const n = getRandomInt(20, Math.min(120, maxPages)), d = getRandomInt(0, 9);
        return { variant: 'occurrences', data: { n, d }, answer: [...pageString(n)].filter(c => c === String(d)).length };
    },
    sum() {
        const k = getRandomInt(10, 30);
        return { variant: 'sum', data: { k }, answer: k * (k + 1) / 2 };
    },
    triples(maxPages) {
        // ponytail: N ≤ 110 keeps every run of equal digits ≤ 3 long (page 111 makes "111111"),
        // so "places with three equal digits" is unambiguous.
        const n = getRandomInt(20, Math.min(110, maxPages));
        const s = pageString(n);
        if (longestRun(s) > 3) throw new Error('Ambiguous triples problem.');
        return { variant: 'triples', data: { n }, answer: countTriples(s) };
    },
};

export function generatePageNumbersData({ maxPages, types, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!MAX_PAGES.includes(maxPages)) throw new Error('Invalid maximum number of pages.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: prose sheet; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, ...MAKERS[type](maxPages) };
        p.text = fillTemplate(t.templates[p.variant], p.data);
        p.controlSum = digitalRoot(p.answer); // a single digit (kth_digit) is its own root, 0 stays 0
        problems.push(p);
    }
    const shuffled = shuffleArray(problems);
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
