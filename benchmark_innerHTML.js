import { JSDOM } from 'jsdom';
import { performance } from 'perf_hooks';

const dom = new JSDOM('<!DOCTYPE html><div id="container"></div>');
const container = dom.window.document.getElementById('container');

const arr = Array.from({ length: 100 }, (_, i) => ({ a: i, b: i * 2 }));

function testAppend() {
    container.innerHTML = '<h3>Title</h3><div class="grid">' + arr.map(i => `<div>${i.a}</div>`).join('') + '</div>';
    if (arr.length > 0) {
        container.innerHTML += '<div>' + arr.map(i => `<div>${i.b}</div>`).join('') + '</div>';
    }
}

function testConcat() {
    let html = '<h3>Title</h3><div class="grid">' + arr.map(i => `<div>${i.a}</div>`).join('') + '</div>';
    if (arr.length > 0) {
        html += '<div>' + arr.map(i => `<div>${i.b}</div>`).join('') + '</div>';
    }
    container.innerHTML = html;
}

const start1 = performance.now();
for (let i = 0; i < 1000; i++) testAppend();
const end1 = performance.now();
console.log(`innerHTML += : ${end1 - start1} ms`);

const start2 = performance.now();
for (let i = 0; i < 1000; i++) testConcat();
const end2 = performance.now();
console.log(`Variable +=  : ${end2 - start2} ms`);
