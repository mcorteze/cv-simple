const MAX_PAGES = 2;
const MAX_BULLET_LENGTH = 220;

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_PATTERN = /\+?\d[\d\s().-]{6,}\d/;
const YEAR_RANGE_PATTERN = /\b\d{4}\s*[-–]\s*\d{4}\b/g;
const SAMPLE_TEXT_PATTERN = /@ejemplo\.|(?:Empresa|Institución|Universidad) Ejemplo|NOMBRE DE LA SECCIÓN|Empresa \/ Ciudad|^### Cargo \|/m;

// Revisa el texto y devuelve los avisos que la persona debería mirar.
export const reviewCV = (markdown, pageCount) => {
    if (!markdown.trim()) return ['El CV está vacío.'];

    const issues = [];
    const header = markdown.split(/^##\s/m)[0];

    if (!/^#\s+\S/m.test(markdown)) issues.push('Falta tu nombre. Escríbelo en la primera línea con # adelante.');
    if (!EMAIL_PATTERN.test(header)) issues.push('Falta un correo en los datos de contacto.');
    if (!PHONE_PATTERN.test(header.replace(YEAR_RANGE_PATTERN, ''))) issues.push('Falta un teléfono en los datos de contacto.');
    if (!/^##\s+\S/m.test(markdown)) issues.push('No hay secciones. Agrega al menos experiencia y educación.');

    [...markdown.matchAll(/^###\s+(.+)$/gm)]
        .filter(([, title]) => !title.includes('|'))
        .forEach(([, title]) => issues.push(`Sin fecha: ${title.replaceAll('*', '').trim()}.`));

    const longBullets = markdown
        .split('\n')
        .filter((line) => /^\s*-\s/.test(line) && line.trim().length > MAX_BULLET_LENGTH).length;
    if (longBullets > 0) {
        issues.push(longBullets === 1
            ? 'Hay 1 punto de lista muy largo. Conviene dividirlo.'
            : `Hay ${longBullets} puntos de lista muy largos. Conviene dividirlos.`);
    }

    if (pageCount > MAX_PAGES) issues.push(`El CV ocupa ${pageCount} páginas. Lo habitual es 1 o 2.`);
    if (SAMPLE_TEXT_PATTERN.test(markdown)) issues.push('Todavía hay datos del ejemplo sin reemplazar.');

    return issues;
};
