// Mock data
const problems = Array.from({ length: 100 }, (_, i) => ({
    num1: i,
    num2: i + 1,
    operator: '+'
}));
const t = { problems_title: 'Title' };

function newRenderReduce() {
    return problems.reduce((html, p) => html + `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`, `<h3>${t.problems_title}</h3><div class="arithmetic-grid">`) + '</div>';
}

function newRenderForOf() {
    let html = `<h3>${t.problems_title}</h3><div class="arithmetic-grid">`;
    for (const p of problems) {
        html += `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`;
    }
    html += '</div>';
    return html;
}

const N = 100000;

const startReduce = process.hrtime.bigint();
let len4 = 0;
for (let i = 0; i < N; i++) {
    len4 += newRenderReduce().length;
}
const endReduce = process.hrtime.bigint();
const timeReduceMs = Number(endReduce - startReduce) / 1000000;

const startForOf = process.hrtime.bigint();
let len5 = 0;
for (let i = 0; i < N; i++) {
    len5 += newRenderForOf().length;
}
const endForOf = process.hrtime.bigint();
const timeForOfMs = Number(endForOf - startForOf) / 1000000;

console.log(`New render (reduce): ${timeReduceMs.toFixed(2)} ms`);
console.log(`New render (for...of): ${timeForOfMs.toFixed(2)} ms`);
