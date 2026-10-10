// Squared-paper ("в клетку") print layout.
//
// The printed worksheet sits on a grid of CELL x CELL squares. Font metrics
// can't be trusted to line glyphs up with that grid (Courier vs. its
// fallbacks, × ÷ − coming from a different font, browser rounding), so
// instead of tuning font sizes we give every glyph its own box:
//
//   snapToCells()    wraps each character of a problem in <span class="gc">
//                    (one cell), each word in <span class="gw"> (a whole
//                    number of cells) and each space in <span class="gs">.
//                    The spans are unstyled on screen; styles/print-grid.css
//                    sizes them in print.
//   layoutForPrint() measures the worksheet with the print stylesheet applied
//                    and picks column/row sizes that are whole cells and fill
//                    the page.
//
// Keep these numbers in sync with styles/print-grid.css (--cell and @page).
export const CELL_MM = 5;
export const PAGE_COLS = 40; // 210mm - 2 * 5mm side margins = 200mm
export const PAGE_ROWS = 57; // 297mm - 2 * 6mm top/bottom margins = 285mm

const MIN_WORK_ROWS = 2; // blank cells kept under every problem
const MAX_COLS = 5;
const CHARS_PER_WORD_CELL = 2; // words are set at a size that fits 2 letters per cell
// A run of letters with a vowel is prose ("of", "Solve"); without one it is
// a product of variables ("xy") and every letter gets its own cell.
const VOWEL_RE = /[aeiouäöüаеёиоуыэюя]/i;

const GRID_SELECTOR = '.arithmetic-grid, .word-problems-grid, .house-problems-grid, .pyramid-problems-grid, .cell-grid';
const NO_CELLS_SELECTOR = '.problem-text, svg';
const TOKEN_RE = /(\s+)|(\p{L}{2,})|([\s\S])/gu;

function tokenize(text) {
    const tokens = [];
    for (const m of text.matchAll(TOKEN_RE)) {
        if (m[1]) tokens.push({ kind: 'space', text: m[1] });
        else if (m[2] && VOWEL_RE.test(m[2])) tokens.push({ kind: 'word', text: m[2] });
        else if (m[2]) [...m[2]].forEach(ch => tokens.push({ kind: 'char', text: ch }));
        else tokens.push({ kind: 'char', text: m[3] });
    }
    return tokens;
}

const isDigit = tok => tok && tok.kind === 'char' && /\d/.test(tok.text);

function isDecimalSeparator(tokens, i) {
    const tok = tokens[i];
    return (tok.text === '.' || tok.text === ',') && isDigit(tokens[i - 1]) && isDigit(tokens[i + 1]);
}

// Splits text into the boxes print will show: { text, className, cells }.
// Written like in an exercise book: one symbol per cell, no empty cells
// between them ("8×2−4=") except after a comma ("2, 4, 6"). Word boxes carry
// their own margin, so spaces next to words are dropped too.
export function planCells(text) {
    const tokens = tokenize(text);
    return tokens.map((tok, i) => {
        if (tok.kind === 'word') {
            // +1 leaves at least half a cell either side of the centred word.
            return { text: tok.text, className: 'gw', cells: Math.ceil([...tok.text].length / CHARS_PER_WORD_CELL) + 1 };
        }
        if (tok.kind === 'space') {
            const prev = tokens[i - 1];
            const keep = prev && (prev.text === ',' || prev.text === ';');
            return { text: tok.text, className: keep ? 'gs gs-keep' : 'gs', cells: keep ? 1 : 0 };
        }
        if (isDecimalSeparator(tokens, i)) {
            // "0,37": the separator sits on the line between two cells.
            return { text: tok.text, className: 'gc gc-sep', cells: 0 };
        }
        return { text: tok.text, className: 'gc', cells: 1 };
    });
}

function cellifyTextNode(node) {
    const frag = document.createDocumentFragment();
    planCells(node.nodeValue).forEach(box => {
        const span = document.createElement('span');
        span.textContent = box.text;
        span.className = box.className;
        if (box.className === 'gw') span.style.setProperty('--n', box.cells);
        frag.appendChild(span);
    });
    node.replaceWith(frag);
}

function cellifyElement(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || parent.closest(NO_CELLS_SELECTOR)) return NodeFilter.FILTER_REJECT;
            if (parent.matches('.gc, .gw, .gs')) return NodeFilter.FILTER_REJECT;
            return node.nodeValue ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(cellifyTextNode);
}

// Width of an element's text in cells, counting only what print shows.
function cellCount(el) {
    let n = 0;
    el.querySelectorAll('.gc:not(.gc-sep), .gs-keep').forEach(() => { n += 1; });
    el.querySelectorAll('.gw').forEach(w => { n += Number(w.style.getPropertyValue('--n')) || 0; });
    return n;
}

function centerFractions(root) {
    root.querySelectorAll('.fraction').forEach(frac => {
        const parts = Array.from(frac.children);
        const widths = parts.map(cellCount);
        const max = Math.max(0, ...widths);
        // Cells can't be split, so an odd difference leans the short part right.
        parts.forEach((part, i) => part.style.setProperty('--pad', Math.ceil((max - widths[i]) / 2)));
    });
}

function sizeMultiplicationChart(root) {
    root.querySelectorAll('.multiplication-chart').forEach(table => {
        const firstRow = table.querySelector('tr');
        const cols = firstRow ? firstRow.children.length : 1;
        const widest = Math.max(1, ...Array.from(table.querySelectorAll('th, td')).map(cellCount));
        table.style.setProperty('--mt-cols', cols);
        table.style.setProperty('--mt-cell-w', widest + 1);
    });
}

export function snapToCells(container) {
    const grid = container.querySelector(GRID_SELECTOR);
    if (grid) {
        grid.classList.add('pg-grid');
        Array.from(grid.children).forEach(item => {
            item.classList.add('pg-item');
            cellifyElement(item);
        });
    }
    container.querySelectorAll('.multiplication-chart, .dr-cell').forEach(cellifyElement);
    centerFractions(container);
    sizeMultiplicationChart(container);
}

const toCells = (px, cellPx) => Math.ceil(px / cellPx - 0.05);

function chooseColumns(count, itemCells) {
    // Leave one blank cell between columns.
    const maxColsByWidth = Math.max(1, Math.floor((PAGE_COLS + 1) / (itemCells + 1)));
    const upperBound = Math.max(1, Math.min(MAX_COLS, count, maxColsByWidth));
    // Aim for a 3:4 (columns:rows) arrangement.
    let best = 1;
    let bestDiff = Infinity;
    for (let cols = 1; cols <= upperBound; cols++) {
        const diff = Math.abs(cols / Math.ceil(count / cols) - 0.75);
        if (diff < bestDiff) {
            bestDiff = diff;
            best = cols;
        }
    }
    return best;
}

export function layoutForPrint(container) {
    const link = document.getElementById('print-grid-css');
    const media = link && link.sheet && link.sheet.media;
    const grid = container.querySelector('.pg-grid');
    if (!media || !grid) return;

    // Lay the worksheet out with the print rules for a moment so we can
    // measure it. Nothing is painted between here and the restore below.
    // Edit the sheet's MediaList, not the <link media> attribute: changing the
    // attribute makes Chrome reload the sheet asynchronously, and the print
    // can then go out without it.
    const prevMedia = media.mediaText;
    media.mediaText = 'all';
    container.classList.add('pg-measuring');
    try {
        const probe = document.createElement('div');
        probe.className = 'pg-probe';
        container.appendChild(probe);
        const cellPx = probe.getBoundingClientRect().width;
        probe.remove();
        if (!cellPx) return;

        const items = Array.from(grid.children);
        grid.style.setProperty('--print-cols', 1);
        grid.style.setProperty('--print-col-cells', PAGE_COLS);
        grid.style.removeProperty('--print-row-size');
        grid.classList.add('pg-natural');
        const itemCells = items.reduce((m, it) => Math.max(m, toCells(it.getBoundingClientRect().width, cellPx)), 1);
        grid.classList.remove('pg-natural');

        const cols = chooseColumns(items.length, itemCells);
        grid.style.setProperty('--print-cols', cols);
        grid.style.setProperty('--print-col-cells', Math.floor(PAGE_COLS / cols));

        const itemRows = items.reduce((m, it) => Math.max(m, toCells(it.getBoundingClientRect().height, cellPx)), 1);
        const top = container.getBoundingClientRect().top;
        const headerRows = toCells(grid.getBoundingClientRect().top - top, cellPx);
        let footerRows = 0;
        for (let el = grid.nextElementSibling; el; el = el.nextElementSibling) {
            footerRows += toCells(el.getBoundingClientRect().height, cellPx);
        }

        const rows = Math.ceil(items.length / cols);
        const available = PAGE_ROWS - headerRows - footerRows - 1; // 1 blank row above the footer
        // Fill the page if every problem still gets a blank row under it;
        // otherwise let it run onto more pages with a little room for work.
        const fitCells = Math.floor(available / rows);
        const rowCells = fitCells > itemRows ? fitCells : itemRows + MIN_WORK_ROWS;
        grid.style.setProperty('--print-row-size', `calc(var(--cell) * ${rowCells})`);
        // Whatever doesn't divide evenly goes above the footer so it sits on the last rows of the page.
        const gapAfter = 1 + Math.max(0, available - rows * rowCells);
        grid.style.setProperty('--print-gap-after', gapAfter);
        // Let the squared background run to the bottom of the last sheet.
        const usedRows = headerRows + rows * rowCells + gapAfter + footerRows;
        container.style.setProperty('--print-sheet-rows', Math.ceil(usedRows / PAGE_ROWS) * PAGE_ROWS);
    } finally {
        media.mediaText = prevMedia;
        container.classList.remove('pg-measuring');
    }
}
