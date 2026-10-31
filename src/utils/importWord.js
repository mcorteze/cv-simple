import mammoth from 'mammoth/mammoth.browser';

const SECTION_PATTERN = /^(perfil|resumen|objetivo|experiencia|educaci[oó]n|formaci[oó]n|estudios|habilidades|competencias|idiomas|certificaciones|cursos|referencias|antecedentes)\b/i;
const MAX_SECTION_LENGTH = 40;

const inlineText = (node) => [...node.childNodes]
    .map((child) => {
        if (child.nodeType === Node.TEXT_NODE) return child.textContent;
        if (child.nodeName === 'BR') return '\n';

        const text = inlineText(child);
        if (['STRONG', 'B'].includes(child.nodeName) && text.trim()) return `**${text.trim()}**`;
        return text;
    })
    .join('');

const isSectionTitle = (text) => {
    const plain = text.replaceAll('*', '').trim();
    if (!plain || plain.length > MAX_SECTION_LENGTH) return false;
    return SECTION_PATTERN.test(plain) || (plain === plain.toUpperCase() && /\p{L}/u.test(plain));
};

const listLines = (list, depth = 0) => [...list.children].flatMap((item) => {
    const nested = [...item.children].filter((child) => ['UL', 'OL'].includes(child.nodeName));
    nested.forEach((child) => child.remove());
    const line = `${'  '.repeat(depth)}- ${inlineText(item).trim()}`;
    return [line, ...nested.flatMap((child) => listLines(child, depth + 1))];
});

const collectBlocks = (parent, blocks) => {
    [...parent.children].forEach((element) => {
        const tag = element.nodeName;
        if (['UL', 'OL'].includes(tag)) {
            blocks.push({ type: 'list', text: listLines(element).join('\n') });
        } else if (/^H[1-6]$/.test(tag)) {
            blocks.push({ type: 'heading', level: Number(tag[1]), text: inlineText(element).replaceAll('*', '').trim() });
        } else if (['TABLE', 'TBODY', 'THEAD', 'TR', 'TD', 'TH'].includes(tag)) {
            // Muchos CV en Word usan tablas para ordenar columnas
            collectBlocks(element, blocks);
        } else {
            const text = inlineText(element).trim();
            if (text) blocks.push({ type: 'paragraph', text });
        }
    });
    return blocks;
};

const blocksToMarkdown = (blocks) => {
    let hasName = false;

    return blocks
        .map(({ type, level, text }) => {
            if (type === 'list') return text;

            if (!hasName) {
                hasName = true;
                return `# ${text.replaceAll('*', '').trim()}`;
            }
            if (type === 'heading') return level <= 2 ? `## ${text}` : `### ${text}`;
            if (isSectionTitle(text)) return `## ${text.replaceAll('*', '').trim()}`;
            return text;
        })
        .join('\n\n');
};

// Convierte un .docx en el formato del editor. Las imágenes se descartan.
export const docxToMarkdown = async (arrayBuffer) => {
    const { value: html } = await mammoth.convertToHtml(
        { arrayBuffer },
        { convertImage: mammoth.images.imgElement(async () => ({ src: '' })) }
    );
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    return `${blocksToMarkdown(collectBlocks(body, []))}\n`;
};
