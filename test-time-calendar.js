import assert from 'assert';
import fs from 'fs';
import { generateTimeCalendarData, TYPES, dayOfYear } from './generators/time-calendar.js';
import { digitalRoot } from './utils.js';

const LOCALES = Object.fromEntries(['en', 'de', 'ru'].map(l => [l, JSON.parse(fs.readFileSync(`./locales/${l}.json`, 'utf8')).script.time_calendar]));
const DAY_MS = 86400000;
const utc = (y, m, d) => Date.UTC(y, m, d);
const isoWeekday = (ms) => ((new Date(ms).getUTCDay() + 6) % 7) + 1;
const jsDayOfYear = (y, m, d) => (utc(y, m, d) - utc(y, 0, 1)) / DAY_MS + 1;
const inDay = (min) => Number.isInteger(min) && min >= 0 && min < 1440;

function gen(types, difficulty, lang = 'en', numberOfProblems = 30) {
    return generateTimeCalendarData({ types, difficulty, numberOfProblems, translations: LOCALES[lang] });
}

function checkProblem(p) {
    const d = p.data, a = p.answer.value;
    switch (p.variant) {
        case 'clock_ago': case 'clock_after': case 'clock_between':
            assert(inDay(d.from) && inDay(d.to) && d.to - d.from === d.duration);
            assert(d.duration >= 5 && d.duration <= 720);
            assert.strictEqual(a, { clock_ago: d.from, clock_after: d.to, clock_between: d.duration }[p.variant]);
            break;
        case 'film_start': case 'film_length':
            assert(inDay(d.start + d.length) && d.half === d.start + d.length / 2 && d.lastStart === d.start + d.length - d.last);
            assert(d.lastStart > d.half);
            assert.strictEqual(a, p.variant === 'film_start' ? d.start : d.length);
            break;
        case 'timeline_arrival': case 'timeline_total': {
            let now = d.start;
            assert(d.legs.length >= 2 && d.legs.length <= 4);
            assert(d.legs[0].mode !== 'wait' && d.legs[d.legs.length - 1].mode !== 'wait');
            d.legs.forEach((l, i) => {
                if (i > 0) assert.notStrictEqual(l.mode, d.legs[i - 1].mode);
                if (l.mode === 'wait') { assert(l.until > now && l.until % 5 === 0); now = l.until; } else { assert(l.minutes >= 5 && l.minutes <= 90); now += l.minutes; }
            });
            assert(inDay(now) && now === d.end);
            assert.strictEqual(a, p.variant === 'timeline_arrival' ? now : now - d.start);
            break;
        }
        case 'periodic_forward': case 'periodic_backward': case 'periodic_count':
            assert(d.period >= 5 && d.period <= 15 && d.n >= 2 && d.n <= 9);
            assert(inDay(d.lit) && inDay(d.later) && d.drop === d.lit + d.n * d.period && d.later < d.drop + d.period);
            assert.strictEqual(a, { periodic_forward: d.drop, periodic_backward: d.lit, periodic_count: Math.floor((d.later - d.lit) / d.period) }[p.variant]);
            break;
        case 'weekday_ago': case 'weekday_ahead': {
            const today = utc(2024, 0, 1) + (d.wd - 1) * DAY_MS; // 2024-01-01 is a Monday
            assert.strictEqual(a, isoWeekday(today + (p.variant === 'weekday_ago' ? -d.days : d.days) * DAY_MS));
            break;
        }
        case 'weekday_from_date':
            for (const y of [2023, 2024]) { // same answer in a leap and a common year
                const shift = (utc(y, d.m2, d.d2) - utc(y, d.m1, d.d1)) / DAY_MS;
                assert(shift > 0 && d.m1 >= 2);
                assert.strictEqual(a, ((d.wd - 1 + shift) % 7) + 1);
            }
            break;
        case 'hotel': {
            const leave = new Date(utc(d.year, d.m1, d.d1) + d.nights * DAY_MS);
            assert.deepStrictEqual([leave.getUTCFullYear(), leave.getUTCMonth(), leave.getUTCDate()], [d.year, d.m2, d.d2]);
            assert.strictEqual(a, jsDayOfYear(d.year, d.m2, d.d2));
            break;
        }
        case 'day_of_year_leap': case 'day_of_year_common':
            assert.strictEqual(a, jsDayOfYear(d.leap ? 2024 : 2023, d.m1, d.d1));
            assert.strictEqual(p.variant === 'day_of_year_leap', d.leap);
            break;
        case 'days_between':
            assert.strictEqual(d.y2, d.y1 + 1);
            assert.strictEqual(a, (utc(d.y2, d.m2, d.d2) - utc(d.y1, d.m1, d.d1)) / DAY_MS);
            break;
        case 'age_weeks_years': assert.strictEqual(a, Math.floor(d.n / 52)); break;
        case 'age_days_years': assert.strictEqual(a, Math.floor(d.n / 365)); break;
        case 'age_days_birthday': assert.strictEqual(a, Math.floor(d.n / 365) + 1); break;
        case 'age_hours_days': assert.strictEqual(a, Math.floor(d.n / 24)); break;
        case 'age_days_weeks': assert.strictEqual(a, Math.floor(d.n / 7)); break;
        case 'clock_gains': case 'clock_jumps':
            assert(inDay(d.set) && inDay(a) && a === d.set + d.hours * d.perHour);
            break;
        default: assert.fail(`unknown variant ${p.variant}`);
    }
    if (p.answer.kind === 'time') assert(inDay(a), `time of day within a day: ${a}`);
    if (p.answer.kind === 'weekday') assert(a >= 1 && a <= 7);
    assert(Number.isInteger(a) && a >= 0);
}

function testAllTypes() {
    const seen = new Set();
    for (const lang of Object.keys(LOCALES)) {
        for (const type of TYPES) {
            for (const difficulty of [1, 2]) {
                for (let run = 0; run < 30; run++) {
                    const { problems, controlSums } = gen([type], difficulty, lang);
                    assert.strictEqual(problems.length, 30);
                    problems.forEach((p, i) => {
                        assert.strictEqual(p.type, type);
                        seen.add(p.variant);
                        checkProblem(p);
                        assert(!/[{}]|undefined|false|NaN/.test(p.text), `${lang} ${p.variant}: unfilled template: ${p.text}`);
                        assert(p.text.length < 260, `${lang} ${p.variant}: at most ~3 lines: ${p.text}`);
                        assert.strictEqual(controlSums[i].controlSum, digitalRoot(p.answer.value));
                        assert(controlSums[i].controlSum >= 0 && controlSums[i].controlSum <= 9);
                        if (difficulty === 1 && ['time', 'duration'].includes(p.answer.kind) && type !== 'faulty') assert.strictEqual(p.answer.value % 5, 0, `easy: steps of 5 (${p.variant})`);
                    });
                }
            }
        }
    }
    const variants = Object.keys(LOCALES.en.templates);
    variants.forEach(v => assert(seen.has(v), `variant generated: ${v}`));
    for (const lang of ['de', 'ru']) assert.deepStrictEqual(Object.keys(LOCALES[lang].templates).sort(), [...variants].sort(), `${lang} has every template`);
    console.log('All sub-types tests passed!');
}

function testMixAndErrors() {
    const { problems } = gen(TYPES, 1, 'de', 12);
    assert.strictEqual(problems.length, 12);
    assert.strictEqual(new Set(problems.map(p => p.type)).size, 6, 'every selected type appears');
    assert.strictEqual(gen(['clock'], 1, 'en', 100).problems.length, 30);
    assert.throws(() => gen([], 1));
    assert.throws(() => gen(['nope'], 1));
    assert.strictEqual(dayOfYear(2, 1, true), 61);
    assert.strictEqual(dayOfYear(11, 31, false), 365);
    assert(gen(['clock'], 1, 'de').problems.some(p => p.text.includes(' Uhr')), 'German times carry "Uhr"');
    console.log('Mix/error tests passed!');
}

testAllTypes();
testMixAndErrors();
console.log('All time-calendar tests passed!');
