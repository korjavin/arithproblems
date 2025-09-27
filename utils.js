export function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

export function digitalRoot(n) {
    let num = Math.abs(n); // Ensure positive for the digit summing process
    let sum = num;
    while (sum >= 10) {
        sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum;
}