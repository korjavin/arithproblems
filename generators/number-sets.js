import { getRandomInt, getRandomFromArray } from '../utils.js';

// Order matters: this is the order of the bubbles under each number.
export const NUMBER_SETS = ['natural', 'whole', 'integers', 'rational', 'irrational'];

// Natural numbers are 1, 2, 3, ...; whole numbers add 0.
function membershipOf({ integer, rational }, value) {
    return {
        natural: integer && value > 0,
        whole: integer && value >= 0,
        integers: integer,
        rational,
        irrational: !rational,
    };
}

function isPerfectSquare(n) {
    const r = Math.round(Math.sqrt(n));
    return r * r === n;
}

function withSign(negative, text, value) {
    return negative ? { display: `−${text}`, value: -value } : { display: text, value };
}

const KINDS = {
    natural: ({ maxValue }) => {
        const n = getRandomInt(1, maxValue);
        return { display: `${n}`, integer: true, rational: true, value: n };
    },
    zero: () => ({ display: '0', integer: true, rational: true, value: 0 }),
    negativeInteger: ({ maxValue }) => {
        const n = getRandomInt(1, maxValue);
        return { display: `−${n}`, integer: true, rational: true, value: -n };
    },
    fraction: ({ maxValue, allowNegative }) => {
        const b = getRandomInt(2, Math.min(maxValue, 12));
        let a;
        do { a = getRandomInt(1, maxValue); } while (a % b === 0);
        const s = withSign(allowNegative && getRandomInt(0, 1) === 0, `${a}/${b}`, a / b);
        return { ...s, integer: false, rational: true };
    },
    // A fraction that is secretly an integer, e.g. 12/4.
    wholeFraction: ({ maxValue, allowNegative }) => {
        const b = getRandomInt(2, Math.min(maxValue, 9));
        const k = getRandomInt(0, Math.max(1, Math.floor(maxValue / b)));
        const s = withSign(allowNegative && k !== 0 && getRandomInt(0, 1) === 0, `${b * k}/${b}`, k);
        return { ...s, integer: true, rational: true };
    },
    terminatingDecimal: ({ maxValue, allowNegative }) => {
        const whole = getRandomInt(0, maxValue);
        const frac = getRandomInt(1, 99);
        const fracText = String(frac).padStart(2, '0').replace(/0$/, '');
        const s = withSign(allowNegative && getRandomInt(0, 1) === 0, `${whole}.${fracText}`, whole + frac / 100);
        return { ...s, integer: false, rational: true };
    },
    repeatingDecimal: ({ allowNegative }) => {
        const pattern = getRandomFromArray(['3', '6', '1', '7', '27', '45', '81', '142']);
        const lead = getRandomFromArray(['0.', '0.', '1.', '2.']);
        const shown = pattern.repeat(Math.ceil(6 / pattern.length));
        const s = withSign(allowNegative && getRandomInt(0, 1) === 0, `${lead}${shown}…`, 0.5);
        return { ...s, integer: false, rational: true };
    },
    // √ of a perfect square, e.g. √49 = 7 (a natural number in disguise).
    perfectRoot: ({ maxValue, allowNegative }) => {
        const r = getRandomInt(1, Math.max(2, Math.min(15, Math.floor(Math.sqrt(maxValue * 4)))));
        const s = withSign(allowNegative && getRandomInt(0, 1) === 0, `√${r * r}`, r);
        return { ...s, integer: true, rational: true };
    },
    squareRoot: ({ maxValue, allowNegative }) => {
        let n;
        do { n = getRandomInt(2, Math.max(3, maxValue)); } while (isPerfectSquare(n));
        const s = withSign(allowNegative && getRandomInt(0, 1) === 0, `√${n}`, Math.sqrt(n));
        return { ...s, integer: false, rational: false };
    },
    piMultiple: ({ allowNegative }) => {
        const text = getRandomFromArray(['π', '2π', '3π', 'π/2', 'π/3', 'π + 1', 'π − 2']);
        const s = withSign(allowNegative && getRandomInt(0, 1) === 0 && !/[+−]/.test(text), text, Math.PI);
        return { ...s, integer: false, rational: false };
    },
    rootSum: ({ maxValue }) => {
        let n;
        do { n = getRandomInt(2, Math.max(3, Math.min(maxValue, 30))); } while (isPerfectSquare(n));
        const k = getRandomInt(1, 9);
        return { display: `√${n} + ${k}`, integer: false, rational: false, value: Math.sqrt(n) + k };
    },
    patternDecimal: () => {
        const text = getRandomFromArray(['0.1010010001…', '0.2020020002…', '0.3030030003…', '0.4040040004…']);
        return { display: text, integer: false, rational: false, value: 0.1 };
    },
};

export function generateNumberSetsData({
    maxValue,
    allowNegative,
    allowIrrational,
    allowTricky,
    numberOfProblems,
}) {
    if (!Number.isFinite(maxValue) || maxValue < 5 || maxValue > 100) {
        throw new Error('Invalid max value.');
    }
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) {
        throw new Error('Invalid number of problems.');
    }

    // Weighted by repetition so the mix of sets stays varied.
    const kinds = ['natural', 'natural', 'zero', 'fraction', 'fraction', 'terminatingDecimal', 'repeatingDecimal'];
    if (allowNegative) kinds.push('negativeInteger', 'negativeInteger');
    if (allowTricky) kinds.push('wholeFraction', 'wholeFraction', 'perfectRoot', 'perfectRoot');
    if (allowIrrational) kinds.push('squareRoot', 'squareRoot', 'piMultiple', 'rootSum', 'patternDecimal');

    const opts = { maxValue, allowNegative };
    const problems = [];
    const controlSums = [];
    const seen = new Set();

    for (let i = 0; i < numberOfProblems; i++) {
        let item = null;
        for (let attempt = 0; attempt < 20; attempt++) {
            const kind = getRandomFromArray(kinds);
            item = { kind, ...KINDS[kind](opts) };
            if (!seen.has(item.display)) break;
        }
        seen.add(item.display);

        const membership = membershipOf(item, item.value);
        problems.push({ display: item.display, kind: item.kind, membership });
        // Self-check: the circled sets as a binary number, ℕ W ℤ ℚ I = 16 8 4 2 1
        // (circling ℕ and ℤ is 10100 = 20). Up to 30, so it takes two digits.
        controlSums.push({ controlSum: NUMBER_SETS.reduce((acc, s) => acc * 2 + (membership[s] ? 1 : 0), 0) });
    }

    return { problems, controlSums };
}
