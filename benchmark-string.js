// Mock data
const problems = Array.from({ length: 100 }, (_, i) => ({
    num1: i,
    num2: i + 1,
    operator: '+'
}));
const t = { problems_title: 'Title' };

function oldRender() {
    return `<h3>${t.problems_title}</h3><div class="arithmetic-grid">${problems.map(p => `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`).join('')}</div>`;
}

function newRenderFor() {
    let html = `<h3>${t.problems_title}</h3><div class="arithmetic-grid">`;
    for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        html += `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`;
    }
    html += '</div>';
    return html;
}

function newRenderJoin() {
    let arr = new Array(problems.length);
    for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        arr[i] = `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`;
    }
    return `<h3>${t.problems_title}</h3><div class="arithmetic-grid">${arr.join('')}</div>`;
}

const N = 100000;

console.log('Running benchmark...');
const startOld = process.hrtime.bigint();
let len1 = 0;
for (let i = 0; i < N; i++) {
    len1 += oldRender().length;
}
const endOld = process.hrtime.bigint();
const timeOldMs = Number(endOld - startOld) / 1000000;

const startFor = process.hrtime.bigint();
let len2 = 0;
for (let i = 0; i < N; i++) {
    len2 += newRenderFor().length;
}
const endFor = process.hrtime.bigint();
const timeForMs = Number(endFor - startFor) / 1000000;

const startJoin = process.hrtime.bigint();
let len3 = 0;
for (let i = 0; i < N; i++) {
    len3 += newRenderJoin().length;
}
const endJoin = process.hrtime.bigint();
const timeJoinMs = Number(endJoin - startJoin) / 1000000;

console.log(`Old render: ${timeOldMs.toFixed(2)} ms`);
console.log(`New render (for loop + string concat): ${timeForMs.toFixed(2)} ms`);
console.log(`New render (preallocated array + join): ${timeJoinMs.toFixed(2)} ms`);
