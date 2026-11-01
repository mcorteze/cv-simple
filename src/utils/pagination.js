const PX_PER_MM = 96 / 25.4;
const A4_HEIGHT_MM = 297;

const isHeading = (element) => /^H[1-3]$/.test(element.tagName);

// Replica las reglas de impresión: un bloque no se parte y un título no queda
// solo al final de la página. Devuelve cada salto con su posición en píxeles y,
// si cae al inicio de un bloque, la posición de ese bloque en el texto (data-pos).
export const computePageBreaks = (page, marginYMm) => {
    const usableHeight = (A4_HEIGHT_MM - 2 * marginYMm) * PX_PER_MM;
    const blocks = [...page.querySelectorAll('h1, h2, h3, p, li')];
    const breaks = [];
    let pageStart = marginYMm * PX_PER_MM;

    blocks.forEach((block, index) => {
        const bottom = block.offsetTop + block.offsetHeight;
        if (bottom - pageStart <= usableHeight) return;

        let first = index;
        while (first > 0 && isHeading(blocks[first - 1])) first -= 1;

        const top = blocks[first].offsetTop;
        if (top > pageStart && bottom - top <= usableHeight) {
            breaks.push({ top, pos: blocks[first].dataset.pos ?? null });
            pageStart = top;
            return;
        }

        // Un bloque más alto que una página no cabe entero en ninguna: se parte
        // entre dos líneas, como lo hace el PDF
        const lineHeight = parseFloat(getComputedStyle(block).lineHeight) || 1;
        while (bottom - pageStart > usableHeight) {
            const lines = Math.max(1, Math.floor((pageStart + usableHeight - block.offsetTop) / lineHeight));
            const next = block.offsetTop + lines * lineHeight;
            if (next <= pageStart) break;
            breaks.push({ top: next, pos: null });
            pageStart = next;
        }
    });

    return breaks;
};
