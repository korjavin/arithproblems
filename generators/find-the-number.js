import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate, plural } from '../utils.js';

// "Find the number" olympiad riddles. Every problem has one hidden positive
// integer `answer`; the self-check digit is its digital root.
//   describe — a number described in words ("seven times 70", "the sum of …")
//   inverse  — "I think of a number, add 96, …, and get 5"
//   halving  — "gives half (and one more) to A, half of the rest to B, … keeps 3"
//   letters  — three linked equations "37 + a = 44, 19 − a = b, a · b = c"
export const TYPES = ['describe', 'inverse', 'halving', 'letters'];
const MAX_TRIES = 500;

// A described number { kind, a, b, value }: a k-fold / k-th part (a = k, b = m)
// or sum / difference / product / quotient of a and b. value ≤ R, operands ≤ M.
function makeTerm(R, M, allowDivision) {
    const kinds = [];
    if (R >= 2) kinds.push('sum');
    if (R < M) kinds.push('difference');
    if (R >= 4) kinds.push('product', 'multiple');
    if (allowDivision && R >= 2 && M >= 4) kinds.push('quotient', 'part');
    const kind = getRandomFromArray(kinds);
    if (kind === 'sum') {
        const value = getRandomInt(2, R);
        const a = getRandomInt(1, value - 1);
        return { kind, a, b: value - a, value };
    }
    if (kind === 'difference') {
        const value = getRandomInt(1, R);
        const b = getRandomInt(1, M - value);
        return { kind, a: value + b, b, value };
    }
    if (kind === 'product') {
        const a = getRandomInt(2, Math.floor(Math.sqrt(R)));
        const b = getRandomInt(2, Math.floor(R / a));
        return { kind, a, b, value: a * b };
    }
    if (kind === 'multiple') {
        const k = getRandomInt(2, Math.min(10, Math.floor(R / 2)));
        const m = getRandomInt(2, Math.floor(R / k));
        return { kind, a: k, b: m, value: k * m };
    }
    // quotient / part: value · k ≤ M
    const value = getRandomInt(2, Math.min(R, Math.floor(M / 2)));
    const k = getRandomInt(2, Math.min(kind === 'part' ? 10 : 12, Math.floor(M / value)));
    return kind === 'part' ? { kind, a: k, b: value * k, value } : { kind, a: value * k, b: k, value };
}

export const OUTER = {
    add: (x, y) => x + y,
    sub: (x, y) => x - y,
    mul: (x, y) => x * y,
    div: (x, y) => x / y,
};

function makeDescribe({ chainLength, maxValue: M, allowHalving }) {
    if (chainLength === 1) {
        const term = makeTerm(M, M, allowHalving);
        return { variant: 'describe_simple', data: { terms: [term] }, answer: term.value };
    }
    const outers = allowHalving ? Object.keys(OUTER) : ['add', 'sub', 'mul'];
    for (let i = 0; i < MAX_TRIES; i++) {
        const outer = getRandomFromArray(outers);
        const small = outer === 'mul' || outer === 'div' ? Math.floor(Math.sqrt(M)) * 2 : M;
        const x = makeTerm(outer === 'div' ? M : small, M, allowHalving);
        const y = makeTerm(outer === 'add' ? M : small, M, allowHalving);
        const value = OUTER[outer](x.value, y.value);
        if (outer === 'div' && (y.value < 2 || !Number.isInteger(value))) continue;
        if (outer === 'mul' && (x.value < 2 || y.value < 2)) continue;
        if (Number.isInteger(value) && value >= 1 && value <= M) {
            return { variant: 'describe_compound', data: { terms: [x, y], outer }, answer: value };
        }
    }
    return makeDescribe({ chainLength: 1, maxValue: M, allowHalving });
}

// One step of an inverse chain applied to cur: { op, k, m } where
// add/sub take n = k (plain), k·m (kfold: "three times 18") or m/k (part).
export function applyStep(cur, s) {
    const n = s.term === 'kfold' ? s.k * s.m : s.term === 'part' ? s.m / s.k : s.k;
    return { add: cur + n, sub: cur - n, mul: cur * s.k, div: cur / s.k }[s.op];
}

// prevOp: never multiply right after dividing (or vice versa) — that undoes the step.
function feasibleSteps(cur, M, allowDivision, prevOp) {
    const steps = [];
    const room = M - cur;
    if (room >= 1) steps.push(() => ({ op: 'add', term: 'plain', k: getRandomInt(1, room) }));
    if (cur >= 2) steps.push(() => ({ op: 'sub', term: 'plain', k: getRandomInt(1, cur - 1) }));
    if (cur * 2 <= M && prevOp !== 'div') steps.push(() => ({ op: 'mul', k: getRandomInt(2, Math.min(9, Math.floor(M / cur))) }));
    const divisors = [2, 3, 4, 5, 6, 7, 8, 9].filter(k => cur % k === 0);
    if (allowDivision && divisors.length && prevOp !== 'mul') steps.push(() => ({ op: 'div', k: getRandomFromArray(divisors) }));
    const kfold = (op, limit) => () => {
        const k = getRandomInt(2, Math.min(10, Math.floor(limit / 2)));
        return { op, term: 'kfold', k, m: getRandomInt(2, Math.floor(limit / k)) };
    };
    if (room >= 4) steps.push(kfold('add', room));
    if (cur - 1 >= 4) steps.push(kfold('sub', cur - 1));
    const part = (op, limit) => () => {
        const k = getRandomInt(2, 10);
        const q = getRandomInt(1, Math.min(limit, Math.floor(M / k)));
        return { op, term: 'part', k, m: q * k };
    };
    if (allowDivision && room >= 1) steps.push(part('add', room));
    if (allowDivision && cur >= 2) steps.push(part('sub', cur - 1));
    return steps;
}

function makeInverse({ chainLength, maxValue: M, allowHalving }) {
    const answer = getRandomInt(2, M);
    let cur = answer;
    const steps = [];
    for (let i = 0; i < chainLength; i++) {
        const step = getRandomFromArray(feasibleSteps(cur, M, allowHalving, steps.at(-1)?.op))();
        cur = applyStep(cur, step);
        steps.push(step);
    }
    return { variant: 'inverse', data: { steps, result: cur }, answer };
}

// Built backwards from what is kept: before a "half" step there were 2·x,
// before a "half and one more" step 2·(x + 1).
function makeHalving({ chainLength, maxValue: M }) {
    const n = Math.min(5, Math.max(2, chainLength + 1));
    for (let i = 0; i < MAX_TRIES; i++) {
        const kept = getRandomInt(1, 9);
        const plus = Array.from({ length: n }, () => getRandomInt(0, 1) === 1);
        const start = plus.reduceRight((x, p) => (p ? 2 * (x + 1) : 2 * x), kept);
        if (start <= M) return { variant: 'halving', data: { kept, plus }, answer: start };
    }
    return { variant: 'halving', data: { kept: 1, plus: Array(n).fill(false) }, answer: 2 ** n };
}

// Linked equations, each a single line with one unknown on the left or right:
// eq1 fixes a, eq2 derives b from a, eq3 derives c from a and b.
function makeLetters({ maxValue: M }) {
    for (let i = 0; i < MAX_TRIES; i++) {
        const a = getRandomInt(2, Math.min(M - 1, 99));
        const p1 = getRandomInt(2, Math.min(M - 1, 99));
        const eq1 = getRandomFromArray([
            () => (p1 + a <= M ? `${p1} + a = ${p1 + a}` : null),
            () => (p1 + a <= M ? `${p1 + a} − a = ${p1}` : null),
            () => (a > p1 ? `a − ${p1} = ${a - p1}` : null),
            () => (p1 <= 9 && p1 * a <= M ? `${p1} · a = ${p1 * a}` : null),
        ])();
        const p2 = getRandomInt(2, Math.min(M - 1, 99));
        const k2 = getRandomInt(2, 9);
        const [eq2, b] = getRandomFromArray([
            () => (p2 > a ? [`${p2} − a = b`, p2 - a] : []),
            () => [`a + ${p2} = b`, a + p2],
            () => [`${k2} · a = b`, k2 * a],
            () => (a > p2 ? [`a − ${p2} = b`, a - p2] : []),
        ])();
        if (!eq1 || !eq2 || b > M) continue;
        const [eq3, c] = getRandomFromArray([
            () => [`a · b = c`, a * b],
            () => [`a + b = c`, a + b],
            () => (b > a ? [`b − a = c`, b - a] : [`a − b = c`, a - b]),
        ])();
        if (c >= 1 && c <= M) return { variant: 'letters', data: { lines: [eq1, eq2, eq3], a, b }, answer: c };
    }
    return { variant: 'letters', data: { lines: ['1 + a = 3', 'a + 1 = b', 'a · b = c'], a: 2, b: 3 }, answer: 6 };
}

const MAKERS = { describe: makeDescribe, inverse: makeInverse, halving: makeHalving, letters: makeLetters };

function termText(term, t) {
    if (term.kind === 'multiple') return fillTemplate(t.multiples[term.a - 1], { m: term.b });
    if (term.kind === 'part') return fillTemplate(t.parts[term.a - 1], { m: term.b });
    return fillTemplate(t.terms[term.kind], { a: term.a, b: term.b });
}

function stepText(s, t) {
    if (s.op === 'mul' && s.k <= 3) return t.steps[s.k === 2 ? 'double' : 'triple'];
    if (s.op === 'div' && s.k === 2) return t.steps.halve;
    const n = s.term === 'kfold' ? termText({ kind: 'multiple', a: s.k, b: s.m }, t)
        : s.term === 'part' ? termText({ kind: 'part', a: s.k, b: s.m }, t) : s.k;
    return fillTemplate(t.steps[s.op], { n: s.op === 'mul' || s.op === 'div' ? s.k : n });
}

function render(p, t) {
    const d = p.data;
    if (p.variant === 'describe_simple') return fillTemplate(t.describe_simple, { x: termText(d.terms[0], t) });
    if (p.variant === 'describe_compound') {
        return fillTemplate(t.describe_compound, { x: termText(d.terms[0], t), y: termText(d.terms[1], t), outer: t.outer[d.outer] });
    }
    if (p.variant === 'inverse') {
        return fillTemplate(t.inverse_template, { steps: d.steps.map(s => stepText(s, t)).join(t.step_separator), result: d.result });
    }
    if (p.variant === 'halving') {
        const name = getRandomFromArray(t.names);
        const receivers = shuffleArray(t.receivers.filter(r => r !== name));
        const item = getRandomFromArray(t.items);
        const gives = d.plus.map((plus, i) => fillTemplate(t.halving_steps[(i === 0 ? 'first' : 'rest') + (plus ? '_plus' : '')], { to: receivers[i % receivers.length] }));
        return fillTemplate(t.halving_template, {
            name, items: item.many, items_count: item.forms[item.forms.length - 1],
            gives: gives.join(t.step_separator), kept: plural(item.forms, d.kept),
        });
    }
    return d.lines.join(', ');
}

export function generateFindTheNumberData({ chainLength = 3, maxValue = 1000, allowHalving = true, types, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    if (![1, 2, 3, 4].includes(chainLength)) throw new Error('Chain length must be 1–4.');
    if (!Number.isInteger(maxValue) || maxValue < 20) throw new Error('Invalid number range.');
    const count = Math.min(30, numberOfProblems); // ponytail: same cap as the other olympiad prose topics
    const opts = { chainLength, maxValue, allowHalving };
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, ...MAKERS[type](opts) };
        p.text = render(p, t);
        p.controlSum = digitalRoot(p.answer);
        problems.push(p);
    }
    for (let i = problems.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [problems[i], problems[j]] = [problems[j], problems[i]];
    }
    // Letter chains print in their own cell grid after the prose, so they go last
    // and the self-check grid keeps the printed order.
    problems.sort((x, y) => (x.type === 'letters') - (y.type === 'letters'));
    return { problems, controlSums: problems.map(p => ({ controlSum: p.controlSum })) };
}
