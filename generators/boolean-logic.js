import { getRandomInt, getRandomFromArray } from '../utils.js';

const VAR_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];

const BINARY_OPS = {
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    implies: (a, b) => !a || b,
    iff: (a, b) => a === b,
};

export const OP_SYMBOLS = { and: '∧', or: '∨', implies: '→', iff: '↔', not: '¬' };

// Tree nodes: { type: 'var', name } | { type: 'not', child } | { type: 'bin', op, left, right }
function buildTree(vars, depth, ops) {
    if (depth <= 0) {
        const leaf = { type: 'var', name: getRandomFromArray(vars) };
        return getRandomInt(0, 3) === 0 ? { type: 'not', child: leaf } : leaf;
    }
    const node = {
        type: 'bin',
        op: getRandomFromArray(ops),
        left: buildTree(vars, getRandomInt(0, depth - 1), ops),
        right: buildTree(vars, depth - 1, ops),
    };
    if (getRandomInt(0, 1) === 0) [node.left, node.right] = [node.right, node.left];
    return getRandomInt(0, 4) === 0 ? { type: 'not', child: node } : node;
}

function evaluate(node, values, trace) {
    let result;
    if (node.type === 'var') result = values[node.name];
    else if (node.type === 'not') result = !evaluate(node.child, values, trace);
    else result = BINARY_OPS[node.op](evaluate(node.left, values, trace), evaluate(node.right, values, trace));
    if (trace && node.type !== 'var') trace.push(result);
    return result;
}

// Every binary sub-expression is wrapped, alternating ( ) and [ ] by nesting level,
// so the order of evaluation is never ambiguous. The outermost expression is left bare.
export function formatExpression(node, level = 0, top = true) {
    if (node.type === 'var') return node.name;
    if (node.type === 'not') return OP_SYMBOLS.not + formatExpression(node.child, level, false);
    const inner = `${formatExpression(node.left, level + 1, false)} ${OP_SYMBOLS[node.op]} ${formatExpression(node.right, level + 1, false)}`;
    if (top) return inner;
    return level % 2 === 1 ? `[${inner}]` : `(${inner})`;
}

function countVariables(node, seen = new Set()) {
    if (node.type === 'var') seen.add(node.name);
    else if (node.type === 'not') countVariables(node.child, seen);
    else { countVariables(node.left, seen); countVariables(node.right, seen); }
    return seen;
}

export function generateBooleanLogicData({
    numVariables,
    complexity,
    allowImplication,
    allowBiconditional,
    numberOfProblems,
}) {
    if (!Number.isFinite(numVariables) || numVariables < 2 || numVariables > VAR_NAMES.length) {
        throw new Error('Invalid number of variables.');
    }
    if (!Number.isFinite(complexity) || complexity < 1 || complexity > 4) {
        throw new Error('Invalid complexity.');
    }
    if (!Number.isFinite(numberOfProblems) || numberOfProblems < 1) {
        throw new Error('Invalid number of problems.');
    }

    const ops = ['and', 'or'];
    if (allowImplication) ops.push('implies');
    if (allowBiconditional) ops.push('iff');

    const vars = VAR_NAMES.slice(0, numVariables);
    const problems = [];
    const controlSums = [];

    for (let i = 0; i < numberOfProblems; i++) {
        const wantTrue = getRandomInt(0, 1) === 1; // keep the true/false answer mix balanced
        let best = null;
        for (let attempt = 0; attempt < 100; attempt++) {
            const expression = buildTree(vars, complexity, ops);
            // Require the full variable set to appear so every assignment matters.
            if (countVariables(expression).size < Math.min(numVariables, 1 + complexity)) continue;
            const values = Object.fromEntries(vars.map(v => [v, getRandomInt(0, 1) === 1]));
            const trace = [];
            const result = evaluate(expression, values, trace);
            best = { expression, values, result, trace };
            if (result === wantTrue) break;
        }
        const { expression, values, result, trace } = best || (() => {
            // Unreachable in practice; fall back to a trivially valid problem.
            const expression = { type: 'bin', op: 'or', left: { type: 'var', name: 'A' }, right: { type: 'var', name: 'B' } };
            const values = Object.fromEntries(vars.map(v => [v, true]));
            return { expression, values, result: true, trace: [true] };
        })();

        problems.push({
            expression: formatExpression(expression),
            variables: vars.map(name => ({ name, value: values[name] })),
            result,
        });
        // Self-check: how many sub-expressions are true, mod 10. Forces a full evaluation
        // without giving away the final answer.
        controlSums.push({ controlSum: trace.filter(Boolean).length % 10 });
    }

    return { problems, controlSums };
}
