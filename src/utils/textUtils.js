const BARE_LINK_PATTERN = /(?<![\w@/.:\-[(])((?:[\w-]+\.)+(?:com|cl|org|io|dev)(?:\/[^\s|)\]]*)?)/g;

// Convierte en enlace lo escrito sin https://, como linkedin.com/in/nombre
export const linkBareDomains = (markdown) => (
    markdown.replace(BARE_LINK_PATTERN, '[$1](https://$1)')
);

export const decodeTextFile = (buffer) => {
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
        // Bloc de notas antiguo guarda en ANSI: sin esto la ñ y los acentos se rompen
        return new TextDecoder('windows-1252').decode(buffer);
    }
};

// Texto limpio para pegar en los formularios de los portales de empleo.
export const markdownToPlainText = (markdown) => (
    markdown
        .split(/\r?\n/)
        .map((line) => line
            .replace(/^###\s+(.+?)\s*\|\s*(.+)$/, '$1 ($2)')
            .replace(/^#{1,3}\s+/, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1'))
        .join('\n')
        .trim()
);
