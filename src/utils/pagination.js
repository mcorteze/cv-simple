const PX_PER_MM = 96 / 25.4;
const A4_HEIGHT_MM = 297;

const isHeading = (element) => /^H[1-3]$/.test(element.tagName);

// Replica las reglas de impresión: un bloque no se parte y un título no queda
// solo al final de la página. Devuelve la posición de cada salto en píxeles.
export const computePageBreaks = (page, marginYMm) => {
    const usableHeight = (A4_HEIGHT_MM - 2 * marginYMm) * PX_PER_MM;
    const blocks = [...page.querySelectorAll('h1, h2, h3, p, li')];
    const breaks = [];
    let pageStart = marginYMm * PX_PER_MM;

    blocks.forEach((block, index) => {
        if (block.offsetTop + block.offsetHeight - pageStart <= usableHeight) return;

        let first = index;
        while (first > 0 && isHeading(blocks[first - 1])) first -= 1;

        const top = blocks[first].offsetTop;
        if (top > pageStart) {
            breaks.push(top);
            pageStart = top;
        }
    });

    return breaks;
};
