import assert from 'assert';
import fs from 'fs';
import { generateMoneyProblemsData, maxAffordable, formatMoney, TYPES, SHOP_PRICES, BAKERY_ITEMS } from './generators/money-problems.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.money_problems]));
const gen = (types, lang = 'en', numberOfProblems = 30) => generateMoneyProblemsData({ types, numberOfProblems, translations: LOCALES[lang] });

// Hand-computed cases.
assert.strictEqual(maxAffordable(540, 45, 3, 120), 13); // 4 packs (480) + 1 single (45) → 13 rolls
assert.strictEqual(maxAffordable(30, 45, 3, 120), 0);
assert.strictEqual(maxAffordable(290, 50, 3, 140), 6);
assert.strictEqual(formatMoney(1420, LOCALES.de), '14,20 €');
assert.strictEqual(formatMoney(5, LOCALES.ru), '0,05 €');
assert.strictEqual(formatMoney(300, LOCALES.en), '€3.00');

const isCents = (x) => Number.isInteger(x) && x >= 0;
// Independent brute force for the pack problem: every (packs, singles) pair.
const brute = (budget, s, k, pack) => {
    let best = 0;
    for (let a = 0; a * pack <= budget; a++) for (let b = 0; a * pack + b * s <= budget; b++) best = Math.max(best, a * k + b);
    return best;
};

function expected(p) {
    const d = p.data;
    Object.values(d).filter(v => typeof v === 'number').forEach(v => assert(Number.isInteger(v), `${p.variant}: integer ${v}`));
    switch (p.variant) {
        case 'pay': {
            assert(d.list.length >= 3 && d.list.length <= 5 && new Set(d.list.map(x => x.i)).size === d.list.length);
            d.list.forEach(x => assert(isCents(x.price) && x.price >= SHOP_PRICES[x.i][0] && x.price <= SHOP_PRICES[x.i][1] && x.price >= 50 && x.price <= 7000));
            assert(d.bought.length >= 2 && d.bought.length <= 3);
            const total = d.bought.reduce((s, i) => s + d.list.find(x => x.i === i).price, 0);
            assert.strictEqual(total, d.total);
            assert([2000, 5000].includes(d.note) && total < d.note);
            return d.note - total;
        }
        case 'affordable': {
            assert(d.item >= 0 && d.item < BAKERY_ITEMS && d.k >= 3 && d.k <= 6);
            assert(d.pack < d.k * d.s && d.pack > (d.k - 1) * d.s, 'pack is cheaper than singles');
            const n = brute(d.budget, d.s, d.k, d.pack);
            assert(n >= 1, 'affordable count ≥ 1');
            return n;
        }
        case 'tariff_even_phone': case 'tariff_even_bus': case 'tariff_diff_phone': case 'tariff_diff_bus': {
            assert(d.p > d.q && d.b > d.a);
            // Break-even: a + n·p = b + n·q, a positive integer.
            assert(Number.isInteger(d.n) && d.n > 0 && d.a + d.n * d.p === d.b + d.n * d.q);
            if (p.variant.startsWith('tariff_even')) return d.n;
            assert(d.usage > 0 && d.usage !== d.n);
            const A = d.a + d.usage * d.p, B = d.b + d.usage * d.q;
            assert.strictEqual(d.cheaper, A < B ? 'A' : 'B');
            assert.strictEqual(d.cheaper === 'A', d.usage < d.n);
            return Math.abs(A - B);
        }
        case 'group': {
            assert(d.off < d.child && d.child < d.adult && d.x >= 2 && d.y >= 2 && d.small >= 2);
            assert.strictEqual(d.discounted, d.x + d.y >= d.t);
            const off = d.x + d.y >= d.t ? d.off : 0; // free children need no ticket
            return d.x * (d.adult - off) + d.y * (d.child - off);
        }
        case 'saving': {
            assert(d.list.some(x => x.i === d.item && x.price === d.price));
            assert(d.saved > 0 && d.saved < d.price && d.allowance > 0);
            let weeks = 0;
            while (d.saved + weeks * d.allowance < d.price) weeks++;
            assert(weeks >= 1);
            return weeks;
        }
        case 'riddle_less': case 'riddle_more': {
            assert([1000, 2000, 5000].includes(d.note) && d.k > 0);
            // Find the price x with change N − x equal to x ∓ k by trying every cent.
            const hits = [];
            for (let x = 0; x <= d.note; x++) if (d.note - x === (p.variant === 'riddle_less' ? x - d.k : x + d.k)) hits.push(x);
            assert.strictEqual(hits.length, 1);
            assert(hits[0] > 0 && hits[0] < d.note);
            return hits[0];
        }
        default: throw new Error(`unknown variant ${p.variant}`);
    }
}

const seen = new Set();
for (const lang of ['en', 'de', 'ru']) {
    const t = LOCALES[lang];
    for (const type of TYPES) {
        for (let run = 0; run < 20; run++) {
            const { problems, controlSums } = gen([type], lang);
            assert.strictEqual(problems.length, 30);
            problems.forEach((p, i) => {
                seen.add(p.variant);
                assert.strictEqual(p.type, type);
                assert(Number.isInteger(p.answer) && p.answer > 0, `${p.variant}: positive integer answer ${p.answer}`);
                assert.strictEqual(expected(p), p.answer, `${p.variant} ${JSON.stringify(p.data)}`);
                assert.strictEqual(p.controlSum, digitalRoot(p.answer));
                assert(p.controlSum >= 0 && p.controlSum <= 9);
                assert.strictEqual(controlSums[i].controlSum, p.controlSum);
                assert(!/{\w+}|undefined|NaN|null/.test(p.text), `unfilled template: ${p.text}`);
                assert(p.text.includes('€'));
                if (lang !== 'en') assert(!/\d\.\d/.test(p.text), `decimal comma in ${lang}: ${p.text}`);
                else assert(!/\d,\d/.test(p.text), `decimal point in en: ${p.text}`);
            });
        }
    }
}
['pay', 'affordable', 'tariff_even_phone', 'tariff_diff_phone', 'tariff_even_bus', 'tariff_diff_bus', 'group', 'saving', 'riddle_less', 'riddle_more']
    .forEach(v => assert(seen.has(v), `variant ${v} generated`));

// Group discount both reached and missed.
const groups = Array.from({ length: 200 }, () => gen(['group'], 'en', 1).problems[0].data.discounted);
assert(groups.includes(true) && groups.includes(false));

// Mixed sheet respects the count and the cap of 30.
assert.strictEqual(gen(TYPES, 'en', 12).problems.length, 12);
assert.strictEqual(gen(TYPES, 'en', 100).problems.length, 30);

// Invalid input.
assert.throws(() => gen([]));
assert.throws(() => gen(['nope']));
assert.throws(() => gen(TYPES, 'en', 0));
assert.throws(() => gen(TYPES, 'en', NaN));

// Locales carry the same keys and list lengths.
const keys = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`])).sort();
for (const l of ['de', 'ru']) {
    assert.deepStrictEqual(keys(LOCALES[l]), keys(LOCALES.en));
    assert.strictEqual(LOCALES[l].shop_items.length, SHOP_PRICES.length);
    assert.strictEqual(LOCALES[l].bakery_items.length, BAKERY_ITEMS);
}
assert.strictEqual(LOCALES.en.shop_items.length, SHOP_PRICES.length);
assert.strictEqual(LOCALES.en.bakery_items.length, BAKERY_ITEMS);

console.log('All money-problems tests passed!');
