import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { pdf } from '@react-pdf/renderer';

import CVDocument from '../components/CVDocument';
import CVPreview from '../components/CVPreview';
import { getMargin, getPageVars } from './cvFormat';
import { downloadBlob, getCvFileName } from './exportUtils';
import { computePageBreaks } from './pagination';

const PT_PER_PX = 0.75;

// Arma la hoja fuera de la pantalla y mide dónde corta cada página y el ancho de las
// columnas de cada tabla. En el teléfono la vista previa puede estar oculta o
// desactualizada, así que no se usa la visible.
const measurePreview = async (markdown, format) => {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.cssText = 'position:fixed;top:0;left:-10000px;visibility:hidden;pointer-events:none;';
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
        const pageRef = React.createRef();
        flushSync(() => root.render(
            <CVPreview ref={pageRef} markdown={markdown} template={format.template} pageVars={getPageVars(format)} />
        ));
        await document.fonts?.ready;
        const page = pageRef.current;
        const breaks = computePageBreaks(page, getMargin(format).yMm)
            .map(({ pos }) => pos)
            .filter((pos) => pos !== null);
        const columnWidths = new Map([...page.querySelectorAll('tr[data-pos]')].map((row) => [
            row.dataset.pos,
            [...row.cells].map((cell) => cell.offsetWidth * PT_PER_PX),
        ]));
        return { breaks: new Set(breaks), columnWidths };
    } finally {
        root.unmount();
        container.remove();
    }
};

// Arma el PDF en el navegador, sin pasar por la ventana de impresión
export const createCvPdf = async (markdown, format) => {
    const title = markdown.match(/^#\s+(.+)$/m)?.[1].trim() ?? 'CV';
    const layout = await measurePreview(markdown, format);
    return pdf(<CVDocument markdown={markdown} format={format} title={title} layout={layout} />).toBlob();
};

export const downloadCvPdf = async (markdown, format) => {
    downloadBlob(await createCvPdf(markdown, format), `${getCvFileName(markdown)}.pdf`);
};
