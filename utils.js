export function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

export function digitalRoot(n) {
    let num = Math.abs(n);
    if (num === 0) return 0;
    let root = num % 9;
    return root === 0 ? 9 : root;
}

/**
 * Returns a cryptographically secure random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomInt(min, max) {
    const range = max - min + 1;
    if (range <= 0) return min;

    const requestBytes = Math.ceil(Math.log2(range) / 8);
    if (!requestBytes) return min;

    const maxNum = Math.pow(256, requestBytes);
    const ar = new Uint8Array(requestBytes);

    while (true) {
        globalThis.crypto.getRandomValues(ar);
        let val = 0;
        for (let i = 0; i < requestBytes; i++) {
            val = (val * 256) + ar[i];
        }

        if (val < maxNum - (maxNum % range)) {
            return min + (val % range);
        }
    }
}

/**
 * Returns a random number with the specified number of digits.
 * @param {number} numDigits
 * @param {boolean} avoidZero - If true, ensures 1-digit numbers are not 0.
 * @returns {number}
 */
export function getRandomNumberByDigits(numDigits, avoidZero = true) {
    if (numDigits <= 0) return avoidZero ? 1 : 0;
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;

    if (numDigits === 1 && avoidZero) {
        return getRandomInt(1, 9);
    }

    return getRandomInt(min, max);
}

/**
 * Returns a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function getRandomFromArray(arr) {
    if (!arr || arr.length === 0) return undefined;
    return arr[getRandomInt(0, arr.length - 1)];
}

/**
 * Returns a new shuffled array using Durstenfeld shuffle algorithm.
 * @param {Array} arr
 * @returns {Array}
 */
export function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}
