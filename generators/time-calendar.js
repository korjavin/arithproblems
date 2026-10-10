import { digitalRoot, getRandomInt, getRandomFromArray, fillTemplate } from '../utils.js';

// Clock, duration and calendar prose problems. Every answer is reduced to one
// integer for the self-check: minutes since midnight (time of day), total
// minutes (duration), ISO weekday Mon=1..Sun=7, day of the year (date), or the
// plain count.
export const TYPES = ['clock', 'timeline', 'periodic', 'calendar', 'age', 'faulty'];
const DAY = 1440;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const yearDays = (leap) => (leap ? 366 : 365);
const monthDays = (m, leap) => MONTH_DAYS[m] + (m === 1 && leap ? 1 : 0);

// 1-based day of the year for month m (0-based) and day d.
export function dayOfYear(m, d, leap) {
    let n = d;
    for (let i = 0; i < m; i++) n += monthDays(i, leap);
    return n;
}

export function fromDayOfYear(n, leap) {
    let m = 0;
    while (n > monthDays(m, leap)) n -= monthDays(m++, leap);
    return { m, d: n };
}

// ISO weekday (1..7) `days` days after weekday `wd` (negative = before).
export const shiftWeekday = (wd, days) => ((((wd - 1 + days) % 7) + 7) % 7) + 1;

// Plural word forms: [one, other] (en/de) or [one, few, many] (ru).
function plural(forms, n) {
    if (forms.length === 2) return `${n} ${n === 1 ? forms[0] : forms[1]}`;
    const m10 = n % 10, m100 = n % 100;
    const form = m10 === 1 && m100 !== 11 ? forms[0] : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? forms[1] : forms[2];
    return `${n} ${form}`;
}

function makeFormat(t) {
    const time = (min) => fillTemplate(t.time_format, { h: Math.floor(min / 60), mm: String(min % 60).padStart(2, '0') });
    const dur = (min) => {
        const h = Math.floor(min / 60), m = min % 60;
        return fillTemplate(h === 0 ? t.duration_m : m === 0 ? t.duration_h : t.duration_hm, { h, m });
    };
    const date = (m, d, y) => fillTemplate(y === undefined ? t.date_format : t.date_format_year, { d, month: t.months[m], y });
    return { time, dur, date, plural: (key, n) => plural(t.plurals[key], n) };
}

// Random multiple of `step` in [min, max].
const pick = (min, max, step) => step * getRandomInt(Math.ceil(min / step), Math.floor(max / step));

const MAKERS = {
    clock(step) {
        const variant = getRandomFromArray(['clock_ago', 'clock_after', 'clock_between', 'film_start', 'film_length']);
        if (variant === 'film_start' || variant === 'film_length') {
            const length = pick(60, 180, 10);
            const last = pick(5, 15, step);
            const start = pick(8 * 60, DAY - 1 - length, step);
            const data = { start, length, last, half: start + length / 2, lastStart: start + length - last };
            return variant === 'film_start'
                ? { variant, data, answer: { kind: 'time', value: start } }
                : { variant, data, answer: { kind: 'duration', value: length } };
        }
        const d = pick(5, 12 * 60, step);
        const from = pick(0, DAY - 1 - d, step);
        const data = { from, to: from + d, duration: d };
        if (variant === 'clock_ago') return { variant, data, answer: { kind: 'time', value: from } };
        if (variant === 'clock_after') return { variant, data, answer: { kind: 'time', value: from + d } };
        return { variant, data, answer: { kind: 'duration', value: d } };
    },

    timeline(step) {
        const start = pick(6 * 60, 10 * 60, step);
        const legs = [];
        let now = start;
        const n = getRandomInt(2, 4);
        for (let i = 0; i < n; i++) {
            // A wait is never first, last, or twice in a row.
            if (i > 0 && i < n - 1 && legs[i - 1].mode !== 'wait' && getRandomInt(0, 2) === 0) {
                // "wait until 9:30": a round wall-clock time 5–30 min ahead.
                now = Math.ceil((now + 5) / 5) * 5 + pick(0, 25, 5);
                legs.push({ mode: 'wait', until: now });
            } else {
                const minutes = pick(5, 90, step);
                const prev = i > 0 && legs[i - 1].mode !== 'wait' ? legs[i - 1].mode : -1;
                legs.push({ mode: (prev + getRandomInt(1, 3) + 4) % 4, minutes }); // never the same mode twice in a row
                now += minutes;
            }
        }
        const variant = getRandomFromArray(['timeline_arrival', 'timeline_total']);
        const data = { start, legs, end: now };
        return variant === 'timeline_arrival'
            ? { variant, data, answer: { kind: 'time', value: now } }
            : { variant, data, answer: { kind: 'duration', value: now - start } };
    },

    periodic(step) {
        const period = step === 5 ? getRandomFromArray([5, 10, 15]) : getRandomInt(5, 15);
        const n = getRandomInt(2, 9);
        const lit = pick(6 * 60, DAY - 1 - (n + 1) * period, step);
        const drop = lit + n * period;
        const variant = getRandomFromArray(['periodic_forward', 'periodic_backward', 'periodic_count']);
        const data = { period, n, lit, drop, later: drop + getRandomInt(0, period - 1) };
        if (variant === 'periodic_forward') return { variant, data, answer: { kind: 'time', value: drop } };
        if (variant === 'periodic_backward') return { variant, data, answer: { kind: 'time', value: lit } };
        return { variant, data, answer: { kind: 'count', value: n } };
    },

    calendar(step) {
        const hard = step === 1;
        const variant = getRandomFromArray(['weekday_ago', 'weekday_ahead', 'weekday_from_date', 'hotel', 'day_of_year', 'days_between']);
        if (variant === 'weekday_ago' || variant === 'weekday_ahead') {
            const wd = getRandomInt(1, 7);
            const days = getRandomInt(8, hard ? 400 : 60);
            return { variant, data: { wd, days }, answer: { kind: 'weekday', value: shiftWeekday(wd, variant === 'weekday_ago' ? -days : days) } };
        }
        if (variant === 'weekday_from_date') {
            // Both dates on or after 1 March, so leap years do not matter.
            const doy1 = getRandomInt(60, 364);
            const a = fromDayOfYear(doy1, false);
            // Easy: later in the same month (or the 1st of the next one).
            const doy2 = getRandomInt(doy1 + 1, hard ? 365 : dayOfYear(a.m, monthDays(a.m, false), false));
            const wd = getRandomInt(1, 7);
            const data = { m1: a.m, d1: a.d, wd, ...prefix(fromDayOfYear(doy2, false), '2') };
            return { variant, data, answer: { kind: 'weekday', value: shiftWeekday(wd, doy2 - doy1) } };
        }
        if (variant === 'hotel') {
            const year = getRandomInt(2023, 2030);
            const leap = isLeap(year);
            const nights = getRandomInt(3, hard ? 40 : 20);
            const doy = getRandomInt(dayOfYear(2, 1, leap), yearDays(leap) - nights);
            const a = fromDayOfYear(doy, leap);
            return { variant, data: { year, m1: a.m, d1: a.d, nights, ...prefix(fromDayOfYear(doy + nights, leap), '2') }, answer: { kind: 'date', value: doy + nights } };
        }
        if (variant === 'day_of_year') {
            const leap = getRandomInt(0, 1) === 1;
            const doy = getRandomInt(hard ? 32 : 1, hard ? yearDays(leap) : 120);
            const a = fromDayOfYear(doy, leap);
            return { variant: leap ? 'day_of_year_leap' : 'day_of_year_common', data: { leap, m1: a.m, d1: a.d }, answer: { kind: 'count', value: doy } };
        }
        // days_between: from autumn of one year to winter/spring of the next.
        const year = getRandomInt(2023, 2030);
        const doy1 = getRandomInt(dayOfYear(hard ? 8 : 11, 1, isLeap(year)), yearDays(isLeap(year)));
        const doy2 = getRandomInt(1, dayOfYear(hard ? 3 : 0, hard ? 30 : 31, isLeap(year + 1)));
        const a = fromDayOfYear(doy1, isLeap(year)), b = fromDayOfYear(doy2, isLeap(year + 1));
        const days = yearDays(isLeap(year)) - doy1 + doy2;
        return { variant, data: { y1: year, m1: a.m, d1: a.d, y2: year + 1, m2: b.m, d2: b.d }, answer: { kind: 'count', value: days } };
    },

    age(step) {
        const repdigit = () => getRandomInt(1, 9) * 111;
        const variant = getRandomFromArray(['age_weeks_years', 'age_days_years', 'age_days_birthday', 'age_hours_days', 'age_days_weeks']);
        const n = {
            age_weeks_years: () => (step === 5 ? repdigit() : getRandomInt(60, 999)),
            age_days_years: () => (step === 5 ? 1111 * getRandomInt(1, 8) : getRandomInt(400, 4000)),
            age_days_birthday: () => (step === 5 ? 1111 * getRandomInt(1, 8) : getRandomInt(400, 4000)),
            age_hours_days: () => (step === 5 ? repdigit() : getRandomInt(50, 999)),
            age_days_weeks: () => (step === 5 ? repdigit() : getRandomInt(50, 999)),
        }[variant]();
        const per = { age_weeks_years: 52, age_days_years: 365, age_days_birthday: 365, age_hours_days: 24, age_days_weeks: 7 }[variant];
        const value = Math.floor(n / per) + (variant === 'age_days_birthday' ? 1 : 0);
        return { variant, data: { n }, answer: { kind: 'count', value } };
    },

    faulty(step) {
        const variant = getRandomFromArray(['clock_gains', 'clock_jumps']);
        const hours = getRandomInt(2, step === 5 ? 6 : 12);
        const perHour = variant === 'clock_gains' ? 60 + getRandomInt(1, 5) : getRandomFromArray([40, 45, 50, 70, 75, 80]);
        const set = pick(0, DAY - 1 - hours * perHour, step);
        return { variant, data: { set, hours, perHour, gain: perHour - 60 }, answer: { kind: 'time', value: set + hours * perHour } };
    },
};

const prefix = (o, suffix) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k + suffix, v]));

function render(p, t, f) {
    const d = p.data;
    const name = getRandomFromArray(t.names);
    const vars = {
        name,
        from: d.from !== undefined && f.time(d.from), to: d.to !== undefined && f.time(d.to), duration: d.duration && f.dur(d.duration),
        half: d.half && f.time(d.half), last: d.last && f.dur(d.last), last_start: d.lastStart && f.time(d.lastStart),
        start: d.start !== undefined && f.time(d.start),
        period: d.period, n: d.n, lit: d.lit && f.time(d.lit), drop: d.drop && f.time(d.drop), later: d.later && f.time(d.later),
        weekday: d.wd && t.weekdays[d.wd - 1], days: d.days && f.plural('day', d.days),
        date1: d.m1 !== undefined && f.date(d.m1, d.d1, d.y1 ?? d.year), date2: d.m2 !== undefined && f.date(d.m2, d.d2, d.y2),
        nights: d.nights && f.plural('night', d.nights),
        n_weeks: d.n && f.plural('week', d.n), n_days: d.n && f.plural('day', d.n), n_hours: d.n && f.plural('hour', d.n),
        set: d.set !== undefined && f.time(d.set), hours: d.hours && f.plural('hour', d.hours), gain: d.gain, per_hour: d.perHour,
    };
    if (p.variant.startsWith('timeline_')) {
        const legs = d.legs.map(l => (l.mode === 'wait'
            ? fillTemplate(t.timeline_wait, { time: f.time(l.until) })
            : fillTemplate(t.timeline_legs[l.mode], { duration: f.dur(l.minutes) })));
        vars.legs = legs.join(t.timeline_separator);
    }
    return fillTemplate(t.templates[p.variant], vars);
}

export function generateTimeCalendarData({ types, difficulty = 1, numberOfProblems, translations: t }) {
    const selected = (types || []).filter(x => TYPES.includes(x));
    if (!selected.length) throw new Error('Select at least one problem type.');
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) throw new Error('Invalid number of problems.');
    // ponytail: prose sheet, 8 fit one A4 page; cap at 30 like the other olympiad topics.
    const count = Math.min(30, numberOfProblems);
    const step = difficulty === 2 ? 1 : 5;
    const f = makeFormat(t);
    const problems = [];
    for (let i = 0; i < count; i++) {
        const type = selected[i % selected.length];
        const p = { type, ...MAKERS[type](step) };
        p.text = render(p, t, f);
        p.controlSum = digitalRoot(p.answer.value);
        problems.push(p);
    }
    // Interleave types so a sheet does not run in blocks.
    for (let i = problems.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [problems[i], problems[j]] = [problems[j], problems[i]];
    }
    return { problems, controlSums: problems.map(p => ({ controlSum: p.controlSum })) };
}
