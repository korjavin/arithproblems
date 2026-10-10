import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate, plural } from '../utils.js';

// Shopping / price-list / tariff story problems. All money is integer cents.
// Each maker returns { variant, data (cents and counts), answer, kind }:
// kind 'money' → answer in cents, 'count' → a number of items/weeks/minutes.
// Self-check digit = digitalRoot(answer) either way.
export const TYPES = ['pay', 'affordable', 'tariff', 'group', 'saving', 'riddle'];

// Toy-shop price ranges in cents, same order as the locale's `shop_items`.
export const SHOP_PRICES = [[500, 1500], [1500, 4000], [3000, 7000], [400, 1200], [500, 1500], [200, 900], [150, 600], [800, 2500], [600, 1800], [1500, 3500]];
export const BAKERY_ITEMS = 3; // length of the locale's `bakery_items`

const step = (lo, hi, s) => getRandomInt(Math.ceil(lo / s), Math.floor(hi / s)) * s;
const shopPrice = (i) => step(SHOP_PRICES[i][0], SHOP_PRICES[i][1], 10);
// 3–5 distinct shop items with prices: [{ i, price }].
const priceList = () => shuffleArray(SHOP_PRICES.map((_, i) => i)).slice(0, getRandomInt(3, 5)).map(i => ({ i, price: shopPrice(i) }));

// Most items for `budget` with single price s and packs of k for pack (pack < k·s).
export function maxAffordable(budget, s, k, pack) {
    let best = 0;
    for (let packs = 0; packs * pack <= budget; packs++) best = Math.max(best, packs * k + Math.floor((budget - packs * pack) / s));
    return best;
}

const MAKERS = {
    pay() {
        for (;;) {
            const list = priceList();
            const bought = shuffleArray(list).slice(0, getRandomInt(2, Math.min(3, list.length)));
            const total = bought.reduce((s, x) => s + x.price, 0);
            if (total >= 5000) continue;
            const note = total < 2000 && getRandomInt(0, 1) === 0 ? 2000 : 5000;
            return { variant: 'pay', kind: 'money', data: { list, bought: bought.map(x => x.i), total, note }, answer: note - total };
        }
    },

    affordable() {
        const s = step(30, 90, 5), k = getRandomInt(3, 6);
        const pack = step((k - 1) * s + 5, k * s - 5, 5);
        const budget = step(Math.max(s, 150), 1000, 5);
        return { variant: 'affordable', kind: 'count', data: { item: getRandomInt(0, BAKERY_ITEMS - 1), s, k, pack, budget }, answer: maxAffordable(budget, s, k, pack) };
    },

    tariff() {
        const phone = getRandomInt(0, 1) === 0;
        // Tariff A: base a + p per unit; B: base b + q per unit, with b − a = n·(p − q),
        // so both cost the same at exactly n units (integer by construction).
        let a, p, q, b, n;
        if (phone) {
            a = step(300, 1000, 50); p = getRandomInt(9, 19); q = p - getRandomInt(2, 8); n = step(20, 200, 10);
        } else {
            a = 0; p = step(150, 300, 10); q = 0; n = getRandomInt(15, 30); // single tickets vs monthly ticket
        }
        b = a + n * (p - q);
        const data = { context: phone ? 'phone' : 'bus', a, p, q, b, n };
        if (getRandomInt(0, 1) === 0) return { variant: `tariff_even_${data.context}`, kind: 'count', data, answer: n };
        let usage;
        do usage = getRandomInt(Math.max(2, n - 15), n + 15); while (usage === n);
        const costA = a + usage * p, costB = b + usage * q;
        return { variant: `tariff_diff_${data.context}`, kind: 'money', data: { ...data, usage, costA, costB, cheaper: costA < costB ? 'A' : 'B' }, answer: Math.abs(costA - costB) };
    },

    group() {
        const adult = step(500, 1200, 50), child = step(200, adult - 100, 50), off = step(50, Math.min(150, child - 50), 50);
        const t = getRandomInt(10, 15), x = getRandomInt(2, 4), small = getRandomInt(2, 3);
        // About half the groups reach the discount threshold, the rest fall just short.
        const y = getRandomInt(0, 1) === 0 ? getRandomInt(Math.max(2, t - x), t - x + 6) : getRandomInt(Math.max(2, t - x - 6), t - x - 1);
        const discount = x + y >= t ? off : 0;
        return { variant: 'group', kind: 'money', data: { adult, child, off, t, x, y, small, discounted: discount > 0 }, answer: x * (adult - discount) + y * (child - discount) };
    },

    saving() {
        const list = priceList(), item = getRandomFromArray(list);
        const saved = step(10, item.price - 100, 10), allowance = step(100, 500, 50);
        return { variant: 'saving', kind: 'count', data: { list, item: item.i, price: item.price, saved, allowance }, answer: Math.ceil((item.price - saved) / allowance) };
    },

    riddle() {
        // N − x = x − k ("k less than the price") or N − x = x + k ("k more").
        const note = getRandomFromArray([1000, 2000, 5000]), less = getRandomInt(0, 1) === 0;
        const k = step(100, note - 200, 10);
        return { variant: less ? 'riddle_less' : 'riddle_more', kind: 'money', data: { note, k }, answer: less ? (note + k) / 2 : (note - k) / 2 };
    },
};

// "14,20 €" (de/ru) or "€14.20" (en), from integer cents.
export function formatMoney(ct, t) {
    const v = `${Math.floor(ct / 100)}${t.decimal_separator}${String(ct % 100).padStart(2, '0')}`;
    return fillTemplate(t.money_format, { v });
}
const euros = (ct, t) => fillTemplate(t.money_format, { v: ct / 100 }); // whole-euro notes
const cents = (ct, t) => fillTemplate(t.cent_format, { n: ct });
const joinAnd = (xs, t) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')}${t.and}${xs[xs.length - 1]}`);
// The price list as prose lines inside the problem text.
const lines = (rows) => rows.map(r => `<br>– ${r}`).join('') + '<br>';

function render(p, t) {
    const d = p.data, m = (ct) => formatMoney(ct, t);
    const name = getRandomFromArray(t.names);
    const shopList = () => lines(d.list.map(x => `${t.shop_items[x.i].name}: ${m(x.price)}`));
    const fill = (key, extra) => fillTemplate(t.templates[key], { name, ...extra });
    switch (p.variant) {
        case 'pay':
            return fill('pay', { list: shopList(), items: joinAnd(d.bought.map(i => t.shop_items[i].acc), t), note: d.note / 100 });
        case 'affordable': {
            const it = t.bakery_items[d.item];
            return fill('affordable', { list: lines([`${it.single}: ${m(d.s)}`, `${fillTemplate(t.pack_format, { k: d.k, many: it.many })}: ${m(d.pack)}`]), budget: m(d.budget), many: it.many });
        }
        case 'tariff_even_phone': case 'tariff_diff_phone': {
            const row = (label, base, per) => fillTemplate(t.phone_tariff_format, { label, base: m(base), per: cents(per, t) });
            const list = lines([row('A', d.a, d.p), row('B', d.b, d.q)]);
            return fill(p.variant, { list, minutes: d.usage && plural(t.minute_forms, d.usage) });
        }
        case 'tariff_even_bus': case 'tariff_diff_bus':
            return fill(p.variant, { list: lines([`${t.single_ticket}: ${m(d.p)}`, `${t.monthly_ticket}: ${m(d.b)}`]), rides: d.usage && plural(t.ride_forms, d.usage) });
        case 'group':
            return fill('group', {
                list: lines([`${t.adult_ticket}: ${m(d.adult)}`, `${t.child_ticket}: ${m(d.child)}`, t.small_free]),
                t: d.t, off: m(d.off), adults: plural(t.adult_forms, d.x), kids: plural(t.child_forms, d.y), small: plural(t.child_forms, d.small),
            });
        case 'saving':
            return fill('saving', { list: shopList(), item: t.shop_items[d.item].acc, saved: m(d.saved), allowance: m(d.allowance) });
        default: // riddle_less / riddle_more
            return fill(p.variant, { note: d.note / 100, k: d.k % 100 ? m(d.k) : euros(d.k, t) });
    }
}

export function generateMoneyProblemsData({ types, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: prose sheet with price lists; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, ...MAKERS[type]() };
        p.text = render(p, t);
        p.controlSum = digitalRoot(p.answer);
        problems.push(p);
    }
    const shuffled = shuffleArray(problems);
    return { problems: shuffled, controlSums: shuffled.map(p => ({ controlSum: p.controlSum })) };
}
