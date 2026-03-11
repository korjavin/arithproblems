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