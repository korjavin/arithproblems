const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><div id="problems-container"></div>');
const container = dom.window.document.getElementById('problems-container');

// Mock data
const problems = Array.from({ length: 1000 }, (_, i) => ({
    num1: i,
    num2: i + 1,
    operator: '+'
}));
const t = { problems_title: 'Title' };

function oldRender() {
    container.innerHTML = `<h3>${t.problems_title}</h3><div class="arithmetic-grid">${problems.map(p => `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`).join('')}</div>`;
}

function newRender() {
    let html = `<h3>${t.problems_title}</h3><div class="arithmetic-grid">`;
    for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        html += `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

const N = 1000;

console.log('Running benchmark...');
const startOld = process.hrtime.bigint();
for (let i = 0; i < N; i++) {
    oldRender();
}
const endOld = process.hrtime.bigint();
const timeOldMs = Number(endOld - startOld) / 1000000;

const startNew = process.hrtime.bigint();
for (let i = 0; i < N; i++) {
    newRender();
}
const endNew = process.hrtime.bigint();
const timeNewMs = Number(endNew - startNew) / 1000000;

console.log(`Old render: ${timeOldMs.toFixed(2)} ms`);
console.log(`New render: ${timeNewMs.toFixed(2)} ms`);
console.log(`Speedup: ${(timeOldMs / timeNewMs).toFixed(2)}x`);
