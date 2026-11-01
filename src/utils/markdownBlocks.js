import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

import { linkBareDomains } from './textUtils';

const parser = unified().use(remarkParse).use(remarkGfm);

// La misma posición que marca la vista previa en cada bloque (data-pos)
const posOf = (node) => String(node.position.start.offset);

// Aplana el texto con formato en tramos: { text, bold, italic, strike, href }
const toRuns = (nodes, style = {}) => nodes.flatMap((node) => {
    switch (node.type) {
        case 'text':
            // Igual que en HTML: los saltos y espacios repetidos se ven como un espacio
            return [{ ...style, text: node.value.replace(/\s+/g, ' ') }];
        case 'inlineCode':
            return [{ ...style, text: node.value }];
        case 'break':
            return [{ ...style, text: '\n' }];
        case 'strong':
            return toRuns(node.children, { ...style, bold: true });
        case 'emphasis':
            return toRuns(node.children, { ...style, italic: true });
        case 'delete':
            return toRuns(node.children, { ...style, strike: true });
        case 'link':
            return toRuns(node.children, { ...style, href: node.url });
        case 'image':
            return node.alt ? [{ ...style, text: node.alt }] : [];
        case 'html':
            return [{ ...style, text: node.value }];
        default:
            return node.children ? toRuns(node.children, style) : [];
    }
});

// Igual que la vista previa: "### Cargo | 2020 - 2022" separa la fecha en el último "|"
const splitDate = (runs) => {
    const last = runs[runs.length - 1];
    if (!last || last.href || !last.text.includes('|')) return { runs, date: null };

    const separator = last.text.lastIndexOf('|');
    const title = last.text.slice(0, separator).trimEnd();
    return {
        runs: [...runs.slice(0, -1), ...(title ? [{ ...last, text: title }] : [])],
        date: last.text.slice(separator + 1).trim(),
    };
};

const listItemBlocks = (list, depth) => list.children.flatMap((item, index) => {
    // Sin número, el PDF dibuja la viñeta según el nivel, como el navegador
    const marker = list.ordered ? `${(list.start ?? 1) + index}.` : null;
    const [first, ...rest] = item.children;
    const ownText = first && first.type !== 'list';
    const inside = ownText ? rest : item.children;

    return [
        // Lo anidado va dentro del elemento: su margen inferior queda después de todo eso
        { kind: 'li', depth, marker, pos: posOf(item), hasInside: inside.length > 0, runs: ownText ? toRuns(first.children ?? [first]) : [] },
        ...inside.flatMap((child) => (
            child.type === 'list'
                ? listItemBlocks(child, depth + 1)
                : nodeBlocks(child).map((block) => ({ ...block, kind: 'li-text', depth }))
        )),
    ].map((block, blockIndex, all) => ({
        ...block,
        // Una lista anidada también deja su margen inferior, aunque no sea la última
        lastInList: block.lastInList || (index === list.children.length - 1 && blockIndex === all.length - 1),
    }));
});

const nodeBlocks = (node) => blockKinds(node).map((block) => ({ pos: posOf(node), ...block }));

const blockKinds = (node) => {
    switch (node.type) {
        case 'heading': {
            if (node.depth === 3) return [{ kind: 'h3', ...splitDate(toRuns(node.children)) }];
            if (node.depth > 3) return [{ kind: 'p', runs: toRuns(node.children, { bold: true }) }];
            return [{ kind: `h${node.depth}`, runs: toRuns(node.children) }];
        }
        case 'paragraph':
            return [{ kind: 'p', runs: toRuns(node.children) }];
        case 'list':
            return listItemBlocks(node, 0);
        case 'blockquote':
            return node.children.flatMap(nodeBlocks);
        case 'code':
        case 'html':
            return node.value.trim() ? [{ kind: 'p', runs: [{ text: node.value }] }] : [];
        case 'table':
            return node.children.map((row, index) => ({
                kind: 'tr',
                pos: posOf(row),
                header: index === 0,
                cells: row.children.map((cell) => toRuns(cell.children)),
                align: node.align,
            }));
        case 'thematicBreak':
            return [{ kind: 'hr' }];
        default:
            return [];
    }
};

// Convierte el CV en una lista plana de bloques para armar el PDF.
// El primer párrafo del documento es la línea de contacto, como en la vista previa.
export const markdownToBlocks = (markdown) => {
    const tree = parser.parse(linkBareDomains(markdown));
    let contactFound = false;

    return tree.children.flatMap((node) => nodeBlocks(node).map((block) => {
        if (node.type === 'paragraph' && !contactFound) {
            contactFound = true;
            return { ...block, kind: 'contact' };
        }
        return block;
    }));
};
