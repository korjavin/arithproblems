import { digitalRoot, getRandomInt, getRandomFromArray, shuffleArray, fillTemplate } from '../utils.js';

export function generateProblemData(templateKey, t, difficultyLevel) {
    const difficultyMultiplier = difficultyLevel === 'easy' ? 1 : difficultyLevel === 'medium' ? 1.5 : difficultyLevel === 'hard' ? 2 : 1 + (getRandomInt(0, 100) / 100);
    function roundToWhole(num) { return Math.round(num); }
    const getRandomName = (type = 'neutral') => getRandomFromArray(t.names[type]);
    const getRandomObject = (type = 'items') => getRandomFromArray(t.objects[type]);

    // This is a large switch statement containing the logic for each word problem template.
    // It's kept here as it's pure data generation logic.
    switch (templateKey) {
        case 'age1': {
            const multiplier = getRandomInt(2, 4);
            const youngerAge = roundToWhole(getRandomInt(5 * difficultyMultiplier, 15 * difficultyMultiplier));
            const olderAge = youngerAge * multiplier;
            const sum = youngerAge + olderAge;
            return { name1: getRandomName(), name2: getRandomName(), multiplier, sum, answer: olderAge };
        }
        case 'age2': {
            const diff = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
            const years = getRandomInt(2, 8);
            const multiplier = getRandomInt(2, 3);
            const currentYounger = getRandomInt(8, 20);
            const currentOlder = currentYounger + diff;
            return { name1: getRandomName(), name2: getRandomName(), diff, years, multiplier, answer: currentOlder };
        }
        case 'age3': {
            const smaller = roundToWhole(getRandomInt(10 * difficultyMultiplier, 30 * difficultyMultiplier));
            const larger = smaller + 1;
            const sum = smaller + larger;
            return { sum, answer: larger };
        }
        case 'age4': {
            const age1 = roundToWhole(getRandomInt(20 * difficultyMultiplier, 50 * difficultyMultiplier));
            const diff = roundToWhole(getRandomInt(2 * difficultyMultiplier, 12 * difficultyMultiplier));
            return { name1: getRandomName(), name2: getRandomName(), age1, diff, answer: age1 + (age1 - diff) };
        }
        case 'age5': {
            const years = getRandomInt(3, 10);
            const final_age = roundToWhole(getRandomInt(20 * difficultyMultiplier, 60 * difficultyMultiplier));
            return { name1: getRandomName(), years, final_age, answer: final_age - years };
        }
        case 'distance1': {
            const time = roundToWhole(getRandomInt(2 * difficultyMultiplier, 8 * difficultyMultiplier));
            const speed = getRandomInt(30, 80);
            const distance = speed * time;
            return { distance, time, answer: speed };
        }
        case 'distance2': {
            const speed1 = getRandomInt(40, 70);
            const speed2 = getRandomInt(30, 60);
            const time = roundToWhole(getRandomInt(2 * difficultyMultiplier, 6 * difficultyMultiplier));
            return { speed1, speed2, time, answer: (speed1 + speed2) * time };
        }
        case 'distance3': {
            const distance1 = roundToWhole(getRandomInt(100 * difficultyMultiplier, 300 * difficultyMultiplier));
            const distance2 = roundToWhole(getRandomInt(80 * difficultyMultiplier, 250 * difficultyMultiplier));
            const time = roundToWhole(getRandomInt(4 * difficultyMultiplier, 10 * difficultyMultiplier));
            return { distance1, distance2, time, answer: Math.round((distance1 + distance2) / time) };
        }
        case 'distance4': {
            const speed = getRandomInt(3, 8);
            const distance = roundToWhole(getRandomInt(12 * difficultyMultiplier, 48 * difficultyMultiplier));
            const adjustedDistance = Math.round(distance / speed) * speed;
            return { name: getRandomName(), speed, distance: adjustedDistance, answer: adjustedDistance / speed };
        }
        case 'distance5': {
            const speed1 = getRandomInt(45, 70);
            const speed2 = getRandomInt(40, 65);
            const totalSpeed = speed1 + speed2;
            const timeHours = getRandomInt(2, 8);
            const distance = totalSpeed * timeHours;
            return { distance, speed1, speed2, answer: timeHours };
        }
        case 'money1': {
            const adult_price = roundToWhole(getRandomInt(8 * difficultyMultiplier, 15 * difficultyMultiplier));
            const child_price = roundToWhole(getRandomInt(3 * difficultyMultiplier, 7 * difficultyMultiplier));
            const adult_tickets = getRandomInt(20, 60);
            const child_tickets = getRandomInt(15, 45);
            const total_tickets = adult_tickets + child_tickets;
            const total_money = adult_tickets * adult_price + child_tickets * child_price;
            return { adult_price, child_price, total_tickets, total_money, answer: adult_tickets };
        }
        case 'money2': {
            const price1 = roundToWhole(getRandomInt(2 * difficultyMultiplier, 8 * difficultyMultiplier));
            const price2 = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
            const item1_count = getRandomInt(3, 12);
            const item2_count = getRandomInt(2, 8);
            const total_items = item1_count + item2_count;
            const total_cost = item1_count * price1 + item2_count * price2;
            const item1 = getRandomObject('items');
            const item2 = getRandomObject('food');
            return { item1, item2, price1, price2, total_items, total_cost, answer: item1_count };
        }
        case 'money3': {
            const quarters = getRandomInt(8, 25);
            const dimes = getRandomInt(10, 30);
            const amount = Math.round((quarters * 25 + dimes * 10)) / 100;
            const total_coins = quarters + dimes;
            return { name: getRandomName(), amount: amount.toFixed(2), total_coins, answer: quarters };
        }
        case 'money4': {
            const bill = roundToWhole(getRandomInt(25 * difficultyMultiplier, 80 * difficultyMultiplier));
            const percent = getRandomInt(15, 25);
            return { bill, percent, answer: Math.round((bill * percent) / 100 * 100) / 100 };
        }
        case 'money5': {
            const amount = roundToWhole(getRandomInt(10 * difficultyMultiplier, 50 * difficultyMultiplier));
            const weeks = getRandomInt(4, 16);
            return { name: getRandomName(), amount, weeks, answer: amount * weeks };
        }
        case 'work1': {
            const time1 = roundToWhole(getRandomInt(3 * difficultyMultiplier, 12 * difficultyMultiplier));
            const time2 = roundToWhole(getRandomInt(4 * difficultyMultiplier, 15 * difficultyMultiplier));
            return { name1: getRandomName(), name2: getRandomName(), time1, time2, answer: Math.round((time1 * time2) / (time1 + time2) * 100) / 100 };
        }
        case 'work2': {
            const time1 = roundToWhole(getRandomInt(2 * difficultyMultiplier, 8 * difficultyMultiplier));
            const time2 = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
            return { time1, time2, answer: Math.round((time1 * time2) / (time1 + time2) * 100) / 100 };
        }
        case 'work3': {
            const rooms = getRandomInt(2, 6);
            const time = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
            const new_rooms = getRandomInt(3, 10);
            const timePerRoom = time / rooms;
            const totalTime = new_rooms * timePerRoom;
            return { name: getRandomName(), rooms, time, new_rooms, answer: Math.round(totalTime * 100) / 100 };
        }
        case 'work4': {
            const items = roundToWhole(getRandomInt(50 * difficultyMultiplier, 200 * difficultyMultiplier));
            const time = getRandomInt(3, 12);
            return { items, time, answer: items * time };
        }
        case 'mixture1': {
            const percent1 = getRandomInt(10, 40);
            const percent2 = getRandomInt(50, 90);
            const gallons = roundToWhole(getRandomInt(5 * difficultyMultiplier, 20 * difficultyMultiplier));
            const target_percent = getRandomInt(percent1 + 5, percent2 - 5);
            const needed = (gallons * (target_percent - percent2)) / (percent1 - target_percent);
            return { percent1, gallons, percent2, target_percent, answer: Math.round(Math.abs(needed) * 100) / 100 };
        }
        case 'mixture2': {
            const percent1 = getRandomInt(15, 35);
            const percent2 = getRandomInt(50, 80);
            const final_percent = getRandomInt(percent1 + 10, percent2 - 5);
            const total_volume = roundToWhole(getRandomInt(20 * difficultyMultiplier, 60 * difficultyMultiplier));
            const volume1 = (total_volume * (final_percent - percent2)) / (percent1 - percent2);
            return { percent1, percent2, total_volume, final_percent, answer: Math.round(Math.abs(volume1) * 100) / 100 };
        }
        case 'mixture3': {
            const price1 = roundToWhole(getRandomInt(8 * difficultyMultiplier, 15 * difficultyMultiplier));
            const price2 = roundToWhole(getRandomInt(12 * difficultyMultiplier, 20 * difficultyMultiplier));
            const total_pounds = getRandomInt(10, 30);
            const avg_price = roundToWhole(getRandomInt(price1 + 1, price2 - 1));
            const pounds1 = (total_pounds * (avg_price - price2)) / (price1 - price2);
            return { price1, price2, total_pounds, avg_price, answer: Math.round(Math.abs(pounds1) * 100) / 100 };
        }
        case 'mixture4': {
            const percent = getRandomInt(15, 45);
            const weight = roundToWhole(getRandomInt(10 * difficultyMultiplier, 50 * difficultyMultiplier));
            return { percent, weight, answer: Math.round((weight * percent) / 100 * 100) / 100 };
        }
        case 'geometry1': {
            const diff = roundToWhole(getRandomInt(3 * difficultyMultiplier, 12 * difficultyMultiplier));
            const width = roundToWhole(getRandomInt(8 * difficultyMultiplier, 25 * difficultyMultiplier));
            const length = width + diff;
            const perimeter = 2 * (length + width);
            return { diff, perimeter, answer: width };
        }
        case 'geometry2': {
            const side1 = Math.round(getRandomInt(5 * difficultyMultiplier, 20 * difficultyMultiplier));
            const side2 = Math.round(getRandomInt(6 * difficultyMultiplier, 18 * difficultyMultiplier));
            const side3 = Math.round(getRandomInt(4 * difficultyMultiplier, 22 * difficultyMultiplier));
            return { side1, side2, side3, answer: side1 + side2 + side3 };
        }
        case 'geometry3': {
            const side = roundToWhole(getRandomInt(6 * difficultyMultiplier, 20 * difficultyMultiplier));
            const perimeter = side * 4;
            return { perimeter, answer: side };
        }
        case 'geometry4': {
            const radius = Math.round(getRandomInt(3 * difficultyMultiplier, 12 * difficultyMultiplier));
            const area = 3.14 * radius * radius;
            return { radius, answer: Math.round(area * 100) / 100 };
        }
        case 'number1': {
            const diff = roundToWhole(getRandomInt(3 * difficultyMultiplier, 15 * difficultyMultiplier));
            const smaller = roundToWhole(getRandomInt(10 * difficultyMultiplier, 40 * difficultyMultiplier));
            const larger = smaller + diff;
            const sum = smaller + larger;
            return { diff, sum, answer: larger };
        }
        case 'number2': {
            const first = getRandomInt(4, 12) * 2;
            const second = first + 2;
            const product = first * second;
            return { product, answer: first };
        }
        case 'number3': {
            const middle = getRandomInt(5, 25) * 2 + 1;
            const first = middle - 2;
            const third = middle + 2;
            const sum = first + middle + third;
            return { sum, answer: middle };
        }
        case 'number4': {
            const result = roundToWhole(getRandomInt(20 * difficultyMultiplier, 100 * difficultyMultiplier));
            const multiplier = getRandomInt(2, 8);
            const addition = roundToWhole(getRandomInt(5 * difficultyMultiplier, 25 * difficultyMultiplier));
            const answer = (result - addition) / multiplier;
            return { multiplier, addition, result, answer: Math.round(answer) };
        }
        case 'percent1': {
            const percent = getRandomInt(10, 95);
            const number = roundToWhole(getRandomInt(20 * difficultyMultiplier, 200 * difficultyMultiplier));
            return { percent, number, answer: Math.round((percent * number) / 100 * 100) / 100 };
        }
        case 'percent2': {
            const whole = roundToWhole(getRandomInt(50 * difficultyMultiplier, 300 * difficultyMultiplier));
            const percent = getRandomInt(15, 85);
            const part = (percent * whole) / 100;
            return { part: Math.round(part), whole, answer: percent };
        }
        case 'percent3': {
            const percent = getRandomInt(20, 80);
            const part = roundToWhole(getRandomInt(15 * difficultyMultiplier, 120 * difficultyMultiplier));
            const whole = (part * 100) / percent;
            return { percent, part, answer: Math.round(whole) };
        }
        case 'percent4': {
            const original_price = roundToWhole(getRandomInt(25 * difficultyMultiplier, 100 * difficultyMultiplier));
            const percent = getRandomInt(15, 50);
            const discount = (original_price * percent) / 100;
            const sale_price = original_price - discount;
            return { original_price, percent, answer: Math.round(sale_price * 100) / 100 };
        }
        // Olympiad templates: built backwards from the solution so every step is an integer.
        // ponytail: difficultyMultiplier is ignored here, scaling would break exact divisions.
        case 'oly1': { // L = M + diff, M = mult * J
            const young = getRandomInt(3, 5), mult = getRandomInt(2, 3), diff = getRandomInt(2, 4);
            return { young, mult, diff, answer: young * mult + diff };
        }
        case 'oly2': { // B + J = sum, J = B - diff
            const older = getRandomInt(6, 15), diff = getRandomInt(2, older - 2);
            return { sum: 2 * older - diff, diff, answer: older };
        }
        case 'oly3': { // older + t = mult * (younger + t)
            const mult = getRandomInt(2, 4), younger = getRandomInt(1, 3), years = getRandomInt(1, 6);
            return { older: mult * (younger + years) - years, younger, mult, answer: years };
        }
        case 'oly4': { // take 1/a, then 1/b of the rest, then 1/c of what remains
            const a = getRandomInt(2, 4), b = getRandomInt(2, 4), c = getRandomInt(2, 4), z = getRandomInt(1, 2);
            return { total: a * b * c * z, a, b, c, answer: (a - 1) * (b - 1) * (c - 1) * z };
        }
        case 'oly5': { // 1/k of seats children, the rest adults + free
            const k = getRandomInt(3, 5), children = getRandomInt(10, 30);
            const rest = (k - 1) * children, free = getRandomInt(5, rest - 5);
            return { k, adults: rest - free, free, answer: k * children };
        }
        case 'oly6': { // son = 2 * mother, daughter = mult * mother
            const mother = getRandomInt(2, 8), mult = getRandomInt(3, 4);
            return { length: (3 + mult) * mother, mult, answer: mult * mother };
        }
        case 'oly7': { // B = D / 2, E = B + more, C = E, A = B + C
            const b = getRandomInt(3, 12), more = getRandomInt(2, 10);
            return { more, total: 7 * b + 3 * more, answer: 2 * b };
        }
        case 'oly8': { // m - k = y + k, m + k = q * (y - k)
            const q = getRandomInt(2, 3), k = getRandomInt(2, 3); // ranges keep ru plurals ("2-3 шарика", "в 2-3 раза") correct
            const y = k * (3 + q) / (q - 1);
            return { k, q, answer: y + 2 * k };
        }
        case 'oly9': { // |F ∪ S| + neither
            const football = getRandomInt(10, 20), swim = getRandomInt(8, 16);
            const both = getRandomInt(2, Math.min(football, swim) - 2), neither = getRandomInt(1, 5);
            return { football, swim, both, neither, answer: football + swim - both + neither };
        }
        case 'oly10': { // A, B, C, E in order; BE = q * AB, AC = AB + bc
            const ab = getRandomInt(2, 8), q = getRandomInt(2, 3), bc = getRandomInt(1, q * ab - 1);
            return { ae: (1 + q) * ab, q, bc, answer: q * ab - bc };
        }
        case 'oly11': { // a each -> left over, b each -> short
            const a = getRandomInt(1, 4), b = a + getRandomInt(1, 2), guests = getRandomInt(3, 10);
            const left = getRandomInt(1, (b - a) * guests - 1);
            return { a, b, left, short: (b - a) * guests - left, answer: guests };
        }
        case 'oly12': { // average of three given numbers and a missing one
            const avg = getRandomInt(8, 20);
            let nums;
            do { nums = [0, 0, 0].map(() => getRandomInt(1, 2 * avg)); } while (4 * avg - nums[0] - nums[1] - nums[2] < 1);
            return { nums: nums.join(', '), avg, answer: 4 * avg - nums[0] - nums[1] - nums[2] };
        }
        default:
            return { answer: 0 };
    }
}

export function generateWordProblemsData({ problemCategory, difficultyLevel, numberOfProblems, translations }) {
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        throw new Error('Invalid number of problems specified.');
    }

    const templateCategories = {
        age: ['age1', 'age2', 'age3', 'age4', 'age5'],
        distance: ['distance1', 'distance2', 'distance3', 'distance4', 'distance5'],
        money: ['money1', 'money2', 'money3', 'money4', 'money5'],
        work: ['work1', 'work2', 'work3', 'work4'],
        mixture: ['mixture1', 'mixture2', 'mixture3', 'mixture4'],
        geometry: ['geometry1', 'geometry2', 'geometry3', 'geometry4'],
        number: ['number1', 'number2', 'number3', 'number4'],
        percentage: ['percent1', 'percent2', 'percent3', 'percent4'],
        olympiad: Array.from({ length: 12 }, (_, i) => `oly${i + 1}`)
    };

    let availableTemplates = [];
    if (problemCategory === 'mixed') {
        availableTemplates = Object.values(templateCategories).flat();
    } else {
        availableTemplates = templateCategories[problemCategory] || [];
    }

    if (availableTemplates.length === 0) {
        throw new Error(`No templates available for selected category: ${problemCategory}`);
    }

    const shuffledTemplates = shuffleArray(availableTemplates);
    const problems = [];
    const digitalRoots = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const templateKey = shuffledTemplates[i % shuffledTemplates.length];
        const template = translations.templates[templateKey];

        let problemData = generateProblemData(templateKey, translations, difficultyLevel);
        let problemText = fillTemplate(template, problemData);
        let answer = problemData.answer;

        problems.push({ text: problemText });
        digitalRoots.push({ digitalRoot: digitalRoot(Math.round(Math.abs(answer))) });
    }

    return { problems, digitalRoots };
}