import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('./index.html', 'utf8');
const dom = new JSDOM(html);
const window = dom.window;
const document = window.document;

global.window = window;
global.document = document;

// Create elements for benchmarking
const container = document.createElement('div');
document.body.appendChild(container);

const numIterations = 1000;
const rootData = [{ root: 1 }, { root: 2 }, { root: 3 }, { root: 4 }, { root: 5 }];

function benchmarkOriginal() {
    const start = process.hrtime.bigint();
    for (let i = 0; i < numIterations; i++) {
        container.innerHTML = `<h3>Title</h3><div class="grid">Some problems</div>`;
        if (rootData.length > 0) {
            container.innerHTML += `<div class="roots">${rootData.map(item => `<div>${item.root}</div>`).join('')}</div>`;
        }
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
}

function benchmarkOptimized() {
    const start = process.hrtime.bigint();
    for (let i = 0; i < numIterations; i++) {
        let htmlContent = `<h3>Title</h3><div class="grid">Some problems</div>`;
        if (rootData.length > 0) {
            htmlContent += `<div class="roots">${rootData.map(item => `<div>${item.root}</div>`).join('')}</div>`;
        }
        container.innerHTML = htmlContent;
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
}

console.log("Running benchmarks...");
// Warmup
benchmarkOriginal();
benchmarkOptimized();

const origTime = benchmarkOriginal();
const optTime = benchmarkOptimized();

console.log(`Original approach time: ${origTime.toFixed(2)} ms`);
console.log(`Optimized approach time: ${optTime.toFixed(2)} ms`);
console.log(`Improvement: ${((origTime - optTime) / origTime * 100).toFixed(2)}%`);
