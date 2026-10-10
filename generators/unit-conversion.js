import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray } from '../utils.js';

// Every quantity is kept as an integer in its family's smallest unit ("base"),
// so there is no floating-point drift; a unit's factor converts to the base.
// `pairs` are the [big, small] unit pairs a problem converts between.
const FAMILIES = {
    length: { units: { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 }, pairs: [['m', 'cm'], ['km', 'm'], ['dm', 'cm'], ['cm', 'mm'], ['m', 'dm'], ['m', 'mm']], decimal: true },
    mass: { units: { g: 1, kg: 1000, t: 1000000 }, pairs: [['kg', 'g'], ['t', 'kg']], decimal: true },
    volume: { units: { ml: 1, l: 1000 }, pairs: [['l', 'ml']], decimal: true },
    time: { units: { s: 1, min: 60, h: 3600, d: 86400, wk: 604800 }, pairs: [['min', 's'], ['h', 'min'], ['d', 'h'], ['wk', 'd']], decimal: false },
    calendar: { units: { mo: 1, yr: 12 }, pairs: [['yr', 'mo']], decimal: false },
    money: { units: { ct: 1, eur: 100 }, pairs: [['eur', 'ct']], decimal: true },
};
// The UI's "time" checkbox covers both clock time and years/months.
const UI_FAMILIES = { length: ['length'], mass: ['mass'], volume: ['volume'], time: ['time', 'calendar'], money: ['money'] };
// Units written as words (Tage, Wochen, ...): they need grammatical case in
// prose, so the sentence-style problems only use the abbreviated units.
const WORD_UNITS = new Set(['d', 'wk', 'mo', 'yr']);
const FRACTION_DENOMINATORS = [2, 3, 4, 5, 8, 10];
const MAX_INT = { 1: 9, 2: 99, 3: 999 };
const MAX_DIGITS = 4;

const UNIT_FACTOR = {};
const UNIT_FAMILY = {};
for (const [name, fam] of Object.entries(FAMILIES)) {
    for (const [u, f] of Object.entries(fam.units)) {
        UNIT_FACTOR[u] = f;
        UNIT_FAMILY[u] = name;
    }
}

export const factorOf = (u) => UNIT_FACTOR[u];

// Decimal places needed to write `base` in unit `u` (Infinity if more than 2).
export function decimalPlaces(base, u) {
    for (let p = 0; p <= 2; p++) {
        if ((base * 10 ** p) % UNIT_FACTOR[u] === 0) return p;
    }
    return Infinity;
}

// The number as shown on the sheet, with '.' as the decimal separator.
export function displayNumber(base, u) {
    const p = decimalPlaces(base, u);
    return (base / UNIT_FACTOR[u]).toFixed(u === 'eur' && p > 0 ? 2 : p);
}

const digitCount = (base, u) => displayNumber(base, u).replace(/\D/g, '').replace(/^0+/, '').length;

function showable(base, u, allowDecimals) {
    if (!Number.isInteger(base) || base <= 0) return false;
    const p = decimalPlaces(base, u);
    if (p > 0 && !(allowDecimals && FAMILIES[UNIT_FAMILY[u]].decimal && p <= 2)) return false;
    return digitCount(base, u) <= MAX_DIGITS;
}

// Ways to write `base` with the pair [U, u]: "2,6 kg", "2 kg 600 g" or "2600 g".
function qtyOptions(base, U, u, allowDecimals, { allowSmall = true } = {}) {
    const options = [];
    if (showable(base, U, allowDecimals)) options.push([{ base, u: U }]);
    const rem = base % UNIT_FACTOR[U];
    if (base > UNIT_FACTOR[U] && rem > 0 && showable(base - rem, U, false) && showable(rem, u, false)) {
        options.push([{ base: base - rem, u: U }, { base: rem, u }]);
    }
    if (allowSmall && showable(base, u, allowDecimals)) options.push([{ base, u }]);
    return options;
}

const pickQty = (...args) => {
    const options = qtyOptions(...args);
    return options.length ? getRandomFromArray(options) : null;
};

// A random amount: n big units, sometimes plus a few small ones.
function randomBase(U, u, maxInt, withRemainder) {
    const ratio = UNIT_FACTOR[U] / UNIT_FACTOR[u];
    let base = getRandomInt(1, maxInt) * UNIT_FACTOR[U];
    if (withRemainder && getRandomInt(0, 1) === 1) base += getRandomInt(1, ratio - 1) * UNIT_FACTOR[u];
    return base;
}

// The blank's answer must itself be writable: whole, or a short decimal when allowed.
const answerOk = (base, u, allowDecimals) => showable(base, u, allowDecimals);

function makeConvert(fam, opts) {
    const [U, u] = getRandomFromArray(fam.pairs);
    const { maxInt, difficulty, allowDecimals } = opts;
    const shape = getRandomInt(0, difficulty === 1 ? 1 : 3);
    if (shape <= 1) {
        // "3 km 250 m = ___ m" or "2600 g = ___ kg"
        const base = randomBase(U, u, maxInt, difficulty > 1 || shape === 1);
        const blankUnit = shape === 0 ? u : U;
        const qty = shape === 0 ? pickQty(base, U, u, allowDecimals, { allowSmall: false }) : (showable(base, u, allowDecimals) ? [{ base, u }] : null);
        if (!qty || !answerOk(base, blankUnit, allowDecimals)) return null;
        return { lhs: [{ qty }], rhs: [{ blank: blankUnit }], blankUnit, answerBase: base };
    }
    // "2,6 t + 413 kg = ___ kg" / "5 m − 35 cm = ___ cm"
    const a = randomBase(U, u, maxInt, true);
    const b = getRandomInt(1, UNIT_FACTOR[U] / UNIT_FACTOR[u] * Math.min(maxInt, 9)) * UNIT_FACTOR[u];
    const minus = shape === 3;
    const answerBase = minus ? a - b : a + b;
    const qa = showable(a, U, allowDecimals) ? [{ base: a, u: U }] : pickQty(a, U, u, allowDecimals);
    const qb = showable(b, u, allowDecimals) ? [{ base: b, u }] : null;
    const blankUnit = allowDecimals && getRandomInt(0, 1) === 1 && answerOk(answerBase, U, true) ? U : u;
    if (!qa || !qb || !answerOk(answerBase, blankUnit, allowDecimals)) return null;
    return { lhs: [{ qty: qa }, { op: minus ? '−' : '+' }, { qty: qb }], rhs: [{ blank: blankUnit }], blankUnit, answerBase };
}

function makeMixed(fam, opts) {
    // "27 min + ___ min = 1 h", "537 g = 1,2 kg − ___ g", "___ h + 2 d 3 h = 1 wk"
    const [U, u] = getRandomFromArray(fam.pairs);
    const { maxInt, allowDecimals } = opts;
    const total = randomBase(U, u, Math.min(maxInt, 9), allowDecimals);
    const steps = total / UNIT_FACTOR[u];
    if (steps < 2) return null;
    const part = getRandomInt(1, steps - 1) * UNIT_FACTOR[u];
    const answerBase = total - part;
    const qTotal = showable(total, U, allowDecimals) ? [{ base: total, u: U }] : pickQty(total, U, u, allowDecimals);
    const qPart = pickQty(part, U, u, allowDecimals);
    if (!qTotal || !qPart || !answerOk(answerBase, u, allowDecimals)) return null;
    const blank = { blank: u };
    const shape = getRandomInt(0, 2);
    const lhs = shape === 0 ? [{ qty: qPart }, { op: '+' }, blank]
        : shape === 1 ? [blank, { op: '+' }, { qty: qPart }]
            : [{ qty: qPart }];
    const rhs = shape === 2 ? [{ qty: qTotal }, { op: '−' }, blank] : [{ qty: qTotal }];
    return { lhs, rhs, blankUnit: u, answerBase };
}

function makeFraction(fam, opts) {
    // "Ein Viertel von 2 kg sind ___ g"
    const pairs = fam.pairs.filter(([U, u]) => !WORD_UNITS.has(U) && !WORD_UNITS.has(u));
    if (!pairs.length) return null;
    const [U, u] = getRandomFromArray(pairs);
    const total = getRandomInt(1, opts.difficulty === 1 ? 1 : Math.min(opts.maxInt, 9)) * UNIT_FACTOR[U];
    const denominator = shuffleArray([...FRACTION_DENOMINATORS]).find(d => total % (d * UNIT_FACTOR[u]) === 0);
    if (!denominator) return null;
    const answerBase = total / denominator;
    if (!showable(total, U, false) || !answerOk(answerBase, u, false)) return null;
    return { denominator, qty: [{ base: total, u: U }], blankUnit: u, answerBase };
}

function makeUnitPrice(fam, opts) {
    // "4 balls cost 39,60 € together. One ball costs ___ €."
    const pairs = fam.pairs.filter(([U, u]) => !WORD_UNITS.has(U) && !WORD_UNITS.has(u));
    if (!pairs.length) return null;
    const [U, u] = getRandomFromArray(pairs);
    const count = getRandomInt(2, 9);
    const total = randomBase(U, u, Math.min(opts.maxInt, 99), true);
    if (total % (count * UNIT_FACTOR[u]) !== 0) return null;
    const answerBase = total / count;
    const qty = pickQty(total, U, u, opts.allowDecimals, { allowSmall: false });
    const blankUnit = opts.allowDecimals && getRandomInt(0, 1) === 1 && answerOk(answerBase, U, true) ? U : u;
    if (!qty || !answerOk(answerBase, blankUnit, opts.allowDecimals)) return null;
    return { count, variant: getRandomInt(0, 1), qty, blankUnit, answerBase };
}

// One item mixes two incompatible families: "672 d − 321 kg = ___".
function makeUnsolvable() {
    // calendar is left out: months next to days would read as convertible.
    const [f1, f2] = shuffleArray(Object.keys(FAMILIES).filter(k => k !== 'calendar')).slice(0, 2).map(k => FAMILIES[k]);
    const randomQty = (fam) => {
        const [U, u] = fam.pairs[0];
        const unit = getRandomFromArray([U, u]);
        return [{ base: getRandomInt(2, 99) * UNIT_FACTOR[unit], u: unit }];
    };
    if (getRandomInt(0, 1) === 0) {
        return { lhs: [{ qty: randomQty(f1) }, { op: getRandomFromArray(['+', '−']) }, { qty: randomQty(f2) }], rhs: [{ blank: null }] };
    }
    return { lhs: [{ blank: f1.pairs[0][1] }, { op: '+' }, { qty: randomQty(f1) }], rhs: [{ qty: randomQty(f2) }] };
}

const MAKERS = { convert: makeConvert, mixed: makeMixed, fraction: makeFraction, unitPrice: makeUnitPrice };

function fallback(fam) {
    const [U, u] = fam.pairs[0];
    const base = UNIT_FACTOR[U];
    return { kind: 'convert', family: UNIT_FAMILY[U], lhs: [{ qty: [{ base, u: U }] }], rhs: [{ blank: u }], blankUnit: u, answerBase: base };
}

// Self-check digit: the digital root of the answer in the blank's unit, or of the
// answer in the base unit (g, ml, mm, s, ct) when that answer is a decimal.
export function unitControlSum(answerBase, blankUnit) {
    const inBlank = answerBase / UNIT_FACTOR[blankUnit];
    return digitalRoot(Number.isInteger(inBlank) ? inBlank : answerBase);
}

export function generateUnitConversionData({ families, difficulty, allowDecimals, includeUnsolvable, numberOfProblems }) {
    const selected = (families || []).flatMap(f => UI_FAMILIES[f] || []);
    if (!selected.length) throw new Error('Select at least one family of units.');
    if (![1, 2, 3].includes(difficulty)) throw new Error('Invalid difficulty.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: a sheet always has 8–30 lines; the shared count input allows 1–100.
    const count = Math.min(30, Math.max(8, numberOfProblems));

    const opts = { difficulty, allowDecimals: !!allowDecimals, maxInt: MAX_INT[difficulty] };
    const kinds = difficulty === 1 ? ['convert', 'convert', 'fraction'] : ['convert', 'mixed', 'fraction', 'unitPrice'];
    const problems = [];
    for (let i = 0; i < count; i++) {
        let problem = null;
        for (let attempt = 0; attempt < 200 && !problem; attempt++) {
            const kind = getRandomFromArray(kinds);
            const family = getRandomFromArray(selected);
            const made = MAKERS[kind](FAMILIES[family], opts);
            if (made) problem = { kind, family, ...made };
        }
        problems.push(problem || fallback(FAMILIES[selected[0]]));
    }
    problems.forEach(p => { p.controlSum = unitControlSum(p.answerBase, p.blankUnit); });

    if (includeUnsolvable) {
        problems[getRandomInt(0, count - 1)] = { kind: 'unsolvable', unsolvable: true, answerBase: null, blankUnit: null, controlSum: 0, ...makeUnsolvable() };
    }
    return { problems, controlSums: problems.map(p => ({ controlSum: p.controlSum })) };
}
