// Ajuste del generador de PDF (@react-pdf/textkit) para que corte las líneas como el navegador.
// Por defecto reparte las palabras con Knuth-Plass y comprime espacios: en un párrafo largo
// el PDF quedaba con otros cortes de línea, y de página, que la vista previa.
// Se aplica al compilar (vite.config.js); si una versión nueva cambia el código, la
// compilación falla en vez de generar PDF distintos sin aviso.

const TEXTKIT_FILE = /@react-pdf[\\/]textkit[\\/]lib[\\/]textkit\.js$/;

// Llena cada línea con todas las palabras que caben, sin comprimir espacios. Una palabra se
// corta tras un guion; y solo si no cabe sola en una línea, en cualquier letra
// (overflow-wrap: anywhere en index.css).
const GREEDY_BREAKS = `
const greedyBreaks = (attributedString, nodes, widths) => {
    const EPSILON = 0.01;
    const breaks = [0];
    let line = 0;
    let lineWidth = 0;
    let pendingGlue = 0;
    let hasContent = false;
    let soft = null;
    let emergency = null;
    const endsWithHyphen = (index) => attributedString.string[nodes[index - 1].end - 1] === '-';
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const max = widths[Math.min(line, widths.length - 1)];
        if (node.type === 'glue') {
            if (hasContent) {
                soft = { index: i, widthAfter: 0 };
                emergency = null;
                pendingGlue += node.width;
            }
            continue;
        }
        if (node.type === 'penalty') {
            if (node.penalty === -linebreak.infinity || !hasContent) continue;
            if (endsWithHyphen(i)) soft = { index: i, widthAfter: 0 };
            else emergency = { index: i, widthAfter: 0 };
            pendingGlue = 0;
            continue;
        }
        if (hasContent && lineWidth + pendingGlue + node.width > max + EPSILON) {
            const cut = soft || emergency;
            if (cut) {
                breaks.push(cut.index);
                line += 1;
                lineWidth = cut.widthAfter;
                pendingGlue = 0;
                soft = null;
                emergency = null;
                hasContent = lineWidth > 0;
            }
        }
        lineWidth += (hasContent ? pendingGlue : 0) + node.width;
        pendingGlue = 0;
        hasContent = true;
        if (soft) soft.widthAfter += node.width;
        if (emergency) emergency.widthAfter += node.width;
    }
    return breaks;
};
`;

const REPLACEMENTS = [
    {
        // Antes del repartidor original se agrega el nuevo
        find: 'const linebreaker = (options) => {',
        replace: `${GREEDY_BREAKS}\nconst linebreaker = (options) => {`,
    },
    {
        find: 'let breaks = linebreak(nodes, availableWidths, tolerance);',
        replace: 'let breaks = greedyBreaks(attributedString, nodes, availableWidths);',
    },
    {
        // El navegador no agrega guion al cortar dentro de una palabra
        find: 'line = insertGlyph(line.string.length, HYPHEN, line);',
        replace: '',
    },
];

export const patchTextkit = (code) => REPLACEMENTS.reduce((result, { find, replace }) => {
    if (!result.includes(find)) {
        throw new Error(`textkitLineBreak: no se encontró «${find}». Revisa el ajuste para esta versión de @react-pdf/textkit.`);
    }
    return result.replace(find, replace);
}, code);

// Plugin de Vite: aplica el ajuste en la compilación y en el servidor de desarrollo
export const textkitLineBreak = () => ({
    name: 'textkit-line-break',
    enforce: 'pre',
    transform(code, id) {
        return TEXTKIT_FILE.test(id) ? patchTextkit(code) : null;
    },
});

// El servidor de desarrollo preempaqueta las dependencias con esbuild, sin pasar por transform
export const textkitLineBreakEsbuild = {
    name: 'textkit-line-break',
    setup(build) {
        build.onLoad({ filter: TEXTKIT_FILE }, async ({ path }) => {
            const { readFile } = await import('node:fs/promises');
            return { contents: patchTextkit(await readFile(path, 'utf8')), loader: 'js' };
        });
    },
};
