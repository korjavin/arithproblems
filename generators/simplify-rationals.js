import { digitalRoot, getRandomInt } from '../utils.js';

const FORM_MONOMIAL = 'monomial';
const FORM_BINOMIAL = 'binomial';
const FORM_QUADRATIC = 'quadratic';

/**
 * Generate problems for simplifying rational expressions.
 *
 * @param {Object} params
 * @param {boolean} [params.includeMonomials]   include fractions like 6x/9x or 12xy/8x
 * @param {boolean} [params.includeBinomials]   include fractions like (6x+12)/(3x+6)
 * @param {boolean} [params.includeQuadratics]  include difference of squares / factorable trinomials
 * @param {number}  [params.coefficientRange]   max coefficient appearing in the unsimplified problem (5..50)
 * @param {number}  params.numberOfProblems
 * @returns {{ problems: Array, controlSums: Array }}
 */
export function generateSimplifyRationalsData({
    includeMonomials = true,
    includeBinomials = true,
    includeQuadratics = false,
    coefficientRange = 10,
    numberOfProblems,
}) {
    if (!numberOfProblems || numberOfProblems < 1) {
        throw new Error('Number of problems must be at least 1');
    }
    if (isNaN(coefficientRange) || coefficientRange < 5 || coefficientRange > 50) {
        throw new Error('Coefficient range must be between 5 and 50');
    }

    const enabledForms = [];
    if (includeMonomials) enabledForms.push(FORM_MONOMIAL);
    if (includeBinomials) enabledForms.push(FORM_BINOMIAL);
    if (includeQuadratics) enabledForms.push(FORM_QUADRATIC);

    if (enabledForms.length === 0) {
        throw new Error('At least one problem form must be enabled');
    }

    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const form = enabledForms[getRandomInt(0, enabledForms.length - 1)];
        let result;

        if (form === FORM_MONOMIAL) {
            result = getRandomInt(0, 1) === 0
                ? generateMonomial(coefficientRange)
                : generateMonomialWithVariables(coefficientRange);
        } else if (form === FORM_BINOMIAL) {
            result = generateBinomial(coefficientRange);
        } else {
            result = getRandomInt(0, 1) === 0
                ? generateQuadraticSimple(coefficientRange)
                : generateQuadraticComplex(coefficientRange);
        }

        problems.push(result.problem);
        controlSums.push({ controlSum: result.controlSum });
    }

    return { problems, controlSums };
}

// Monomial: ax / bx → a/b
function generateMonomial(maxCoeff) {
    const maxSimplified = Math.max(2, Math.floor(maxCoeff / 2));
    const simpNum = getRandomInt(2, maxSimplified);
    const simpDen = getRandomInt(2, maxSimplified);
    const maxCF = Math.max(2, Math.floor(maxCoeff / Math.max(simpNum, simpDen)));
    const commonFactor = getRandomInt(2, Math.min(5, maxCF));

    const num = simpNum * commonFactor;
    const den = simpDen * commonFactor;

    return {
        problem: { numerator: `${num}x`, denominator: `${den}x` },
        controlSum: digitalRoot(simpNum + simpDen),
    };
}

// Monomial with multiple variables: a·xy / b·x → (a/b)·y
function generateMonomialWithVariables(maxCoeff) {
    const maxSimplified = Math.max(2, Math.floor(maxCoeff / 2));
    const simpNum = getRandomInt(2, maxSimplified);
    const simpDen = getRandomInt(2, maxSimplified);
    const maxCF = Math.max(2, Math.floor(maxCoeff / Math.max(simpNum, simpDen)));
    const commonFactor = getRandomInt(2, Math.min(4, maxCF));

    const num = simpNum * commonFactor;
    const den = simpDen * commonFactor;

    const denVar = getRandomInt(0, 1) === 0 ? 'x' : 'y';

    return {
        problem: { numerator: `${num}xy`, denominator: `${den}${denVar}` },
        controlSum: digitalRoot(simpNum + simpDen),
    };
}

// Binomial with common factor: (cf·a·x + cf·b) / (a·x + b) → cf
//                              or (cf·c1·x + cf·c2) / (c1·x + c2) → cf (same shape, separate branch keeps variety)
function generateBinomial(maxCoeff) {
    const variant = getRandomInt(0, 1);

    if (variant === 0) {
        const maxAB = Math.max(2, Math.floor(maxCoeff / 2));
        const a = getRandomInt(2, Math.min(6, maxAB));
        const b = getRandomInt(2, Math.min(6, maxAB));
        const maxCF = Math.max(2, Math.floor(maxCoeff / Math.max(a, b)));
        const cf = getRandomInt(2, Math.min(5, maxCF));

        return {
            problem: { numerator: `${a * cf}x + ${b * cf}`, denominator: `${a}x + ${b}` },
            controlSum: digitalRoot(cf),
        };
    }

    const maxFactor = Math.max(2, Math.floor(maxCoeff / 2));
    const factorNum = getRandomInt(2, Math.min(4, maxFactor));
    const maxCoeffs = Math.max(2, Math.floor(maxCoeff / factorNum));
    const coeff1 = getRandomInt(2, Math.min(6, maxCoeffs));
    const coeff2 = getRandomInt(2, Math.min(6, maxCoeffs));

    return {
        problem: {
            numerator: `${factorNum * coeff1}x + ${factorNum * coeff2}`,
            denominator: `${coeff1}x + ${coeff2}`,
        },
        controlSum: digitalRoot(factorNum),
    };
}

// Difference of squares or simple factorable trinomial.
function generateQuadraticSimple(maxCoeff) {
    const maxSqrt = Math.max(2, Math.floor(Math.sqrt(maxCoeff)));
    const type = getRandomInt(0, 2);

    if (type === 0) {
        const a = getRandomInt(2, Math.min(6, maxSqrt));
        return {
            problem: { numerator: `x² - ${a * a}`, denominator: `x + ${a}` },
            controlSum: digitalRoot(1 + a),
        };
    }
    if (type === 1) {
        const a = getRandomInt(2, Math.min(6, maxSqrt));
        return {
            problem: { numerator: `x² - ${a * a}`, denominator: `x - ${a}` },
            controlSum: digitalRoot(1 + a),
        };
    }

    // (x² + (d+e)x + d·e) / (x + d) → x + e
    const d = getRandomInt(2, Math.min(5, maxSqrt));
    const e = getRandomInt(2, Math.min(5, maxSqrt));
    return {
        problem: { numerator: `x² + ${d + e}x + ${d * e}`, denominator: `x + ${d}` },
        controlSum: digitalRoot(1 + e),
    };
}

// More complex quadratic simplifications.
function generateQuadraticComplex(maxCoeff) {
    const maxSqrt = Math.max(2, Math.floor(Math.sqrt(maxCoeff)));
    const type = getRandomInt(0, 2);

    if (type === 0) {
        // (coeff·x² + coeff·a·x) / (x² - a²) → coeff·x / (x - a)
        const a = getRandomInt(2, Math.min(5, maxSqrt));
        const maxCoeffVar = Math.max(2, Math.floor(maxCoeff / Math.max(a, 1)));
        const coeff = getRandomInt(2, Math.min(4, maxCoeffVar));
        return {
            problem: { numerator: `${coeff}x² + ${coeff * a}x`, denominator: `x² - ${a * a}` },
            controlSum: digitalRoot(coeff + a),
        };
    }
    if (type === 1) {
        // (x² - b·x) / (x² - b²) → x / (x + b)
        const b = getRandomInt(2, Math.min(6, maxSqrt));
        return {
            problem: { numerator: `x² - ${b}x`, denominator: `x² - ${b * b}` },
            controlSum: digitalRoot(1 + b),
        };
    }

    // (a·x² + 2·a·b·x + a·b²) / (a·x + a·b) → x + b
    const maxA = Math.max(2, Math.floor(maxCoeff / 4));
    const a = getRandomInt(2, Math.min(4, maxA));
    const maxB = Math.max(2, Math.floor(Math.sqrt(maxCoeff / a)));
    const b = getRandomInt(2, Math.min(5, maxB));
    return {
        problem: {
            numerator: `${a}x² + ${2 * a * b}x + ${a * b * b}`,
            denominator: `${a}x + ${a * b}`,
        },
        controlSum: digitalRoot(1 + b),
    };
}
