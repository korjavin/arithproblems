import { generateBooleanLogicData } from './generators/boolean-logic.js';
import assert from 'assert';

// Independent evaluator: parses the printed expression (precedence-free, fully bracketed).
function evalString(expr, vals) {
    const tokens = expr.replace(/\[/g, '(').replace(/\]/g, ')').match(/[A-F]|[¬∧∨→↔()]/g);
    let pos = 0;
    function parseExpr() {
        let left = parseUnary();
        if (['∧', '∨', '→', '↔'].includes(tokens[pos])) {
            const op = tokens[pos++];
            const right = parseUnary();
            assert(!['∧', '∨', '→', '↔'].includes(tokens[pos]), 'chained operators without brackets');
            if (op === '∧') return left && right;
            if (op === '∨') return left || right;
            if (op === '→') return !left || right;
            return left === right;
        }
        return left;
    }
    function parseUnary() {
        const tok = tokens[pos++];
        if (tok === '¬') return !parseUnary();
        if (tok === '(') { const v = parseExpr(); assert.strictEqual(tokens[pos++], ')'); return v; }
        return vals[tok];
    }
    const v = parseExpr();
    assert.strictEqual(pos, tokens.length, 'all tokens consumed');
    return v;
}

function testShapeAndAnswers() {
    for (const complexity of [1, 2, 3, 4]) {
        const { problems, controlSums } = generateBooleanLogicData({
            numVariables: 5, complexity, allowImplication: true, allowBiconditional: true, numberOfProblems: 40,
        });
        assert.strictEqual(problems.length, 40);
        assert.strictEqual(controlSums.length, 40);
        problems.forEach((p, i) => {
            const vals = Object.fromEntries(p.variables.map(v => [v.name, v.value]));
            assert.strictEqual(p.variables.length, 5);
            assert.strictEqual(evalString(p.expression, vals), p.result, `answer ${i}: ${p.expression}`);
            assert(controlSums[i].controlSum >= 0 && controlSums[i].controlSum <= 9);
        });
    }
}

function testOperatorToggles() {
    const { problems } = generateBooleanLogicData({
        numVariables: 4, complexity: 3, allowImplication: false, allowBiconditional: false, numberOfProblems: 50,
    });
    problems.forEach(p => assert(!/[→↔]/.test(p.expression), `no → or ↔ in ${p.expression}`));
}

function testMixedAnswers() {
    const { problems } = generateBooleanLogicData({
        numVariables: 4, complexity: 3, allowImplication: true, allowBiconditional: true, numberOfProblems: 100,
    });
    const trues = problems.filter(p => p.result).length;
    assert(trues > 20 && trues < 80, `balanced answers, got ${trues} true of 100`);
}

function testValidation() {
    const base = { numVariables: 4, complexity: 2, allowImplication: true, allowBiconditional: true, numberOfProblems: 1 };
    assert.throws(() => generateBooleanLogicData({ ...base, numVariables: 1 }));
    assert.throws(() => generateBooleanLogicData({ ...base, numVariables: 7 }));
    assert.throws(() => generateBooleanLogicData({ ...base, complexity: 0 }));
    assert.throws(() => generateBooleanLogicData({ ...base, numberOfProblems: 0 }));
}

testShapeAndAnswers();
testOperatorToggles();
testMixedAnswers();
testValidation();
console.log('Boolean logic tests passed.');
