import React from 'react';
import { Document, Font, Link, Page, Text, View } from '@react-pdf/renderer';

import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import inter400i from '@fontsource/inter/files/inter-latin-400-italic.woff?url';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff?url';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff?url';
import inter600i from '@fontsource/inter/files/inter-latin-600-italic.woff?url';
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import inter700i from '@fontsource/inter/files/inter-latin-700-italic.woff?url';
import serif400 from '@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff?url';
import serif400i from '@fontsource/source-serif-4/files/source-serif-4-latin-400-italic.woff?url';
import serif600 from '@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff?url';
import serif600i from '@fontsource/source-serif-4/files/source-serif-4-latin-600-italic.woff?url';
import serif700 from '@fontsource/source-serif-4/files/source-serif-4-latin-700-normal.woff?url';
import serif700i from '@fontsource/source-serif-4/files/source-serif-4-latin-700-italic.woff?url';

import { FONT_SIZES, SPACINGS, getMargin } from '../utils/cvFormat';
import { markdownToBlocks } from '../utils/markdownBlocks';

Font.register({
    family: 'Inter',
    fonts: [
        { src: inter400 },
        { src: inter400i, fontStyle: 'italic' },
        { src: inter500, fontWeight: 500 },
        { src: inter600, fontWeight: 600 },
        { src: inter600i, fontWeight: 600, fontStyle: 'italic' },
        { src: inter700, fontWeight: 700 },
        { src: inter700i, fontWeight: 700, fontStyle: 'italic' },
    ],
});

Font.register({
    family: 'Source Serif 4',
    fonts: [
        { src: serif400 },
        { src: serif400i, fontStyle: 'italic' },
        { src: serif600, fontWeight: 600 },
        { src: serif600i, fontWeight: 600, fontStyle: 'italic' },
        { src: serif700, fontWeight: 700 },
        { src: serif700i, fontWeight: 700, fontStyle: 'italic' },
    ],
});

// Cada letra es un punto de corte posible, como overflow-wrap: anywhere en la vista previa.
// El ajuste de textkitLineBreak.js solo los usa si la palabra no cabe sola en una línea;
// tras un guion, en cambio, corta como cualquier navegador.
Font.registerHyphenationCallback((word) => word.match(/[^-]-*|-+/gu) ?? [word]);

// Medidas tomadas de index.css: 1rem = 16px = 12pt y 1px = 0.75pt. Cada texto con otro
// tamaño de letra declara su interlineado: heredado, se calcularía con la letra base.
const REM = 12;
const PX = 0.75;

const HEADING_KINDS = ['h1', 'h2', 'h3'];

// Alto de las letras (ascendente y descendente) en proporción al tamaño, medido en cada fuente
const FONT_METRICS = {
    Inter: { ascent: 0.969, height: 1.21 },
    'Source Serif 4': { ascent: 1.036, height: 1.371 },
};

// Diámetro de la viñeta y cuánto queda bajo la línea base su centro, en proporción a la letra
const BULLET_SIZE = 0.36;
const BULLET_RISE = 0.27;

// Hasta este largo un bloque cabe de sobra en una hoja con cualquier formato
const MAX_UNSPLIT_CHARS = 1500;

const buildStyles = (template, size, lineHeight) => {
    const isFormal = template === 'formal';
    const isModern = template === 'moderno';
    const centered = isModern ? 'left' : 'center';
    const accent = isModern ? '#1f3a5f' : '#000';
    const fontFamily = isFormal ? 'Source Serif 4' : 'Inter';
    const metrics = FONT_METRICS[fontFamily];

    // El navegador reparte el espacio extra de la línea arriba y abajo del texto; el PDF lo
    // deja todo abajo. Este desplazamiento baja el texto a la misma altura sin cambiar el alto.
    const lead = (fontSize, height = lineHeight) => ((height - metrics.height) * fontSize) / 2;

    return {
        page: {
            fontFamily,
            fontSize: size,
            lineHeight,
            color: '#1a202c',
        },
        h1: {
            fontSize: 2.2 * size,
            fontWeight: 700,
            lineHeight: 1.2,
            top: lead(2.2 * size, 1.2),
            letterSpacing: -0.02 * 2.2 * size,
            textAlign: centered,
            color: '#000',
            margin: [0, 0.4 * REM],
        },
        contact: {
            fontSize: 0.95 * size,
            lineHeight,
            top: lead(0.95 * size),
            textAlign: centered,
            color: '#4a5568',
            margin: [0, 1.5 * REM],
        },
        h2: {
            fontSize: (isFormal ? 1.25 : 1.15) * size,
            lineHeight,
            top: lead((isFormal ? 1.25 : 1.15) * size),
            fontWeight: isFormal || isModern ? 700 : 600,
            textTransform: isFormal ? 'none' : 'uppercase',
            letterSpacing: isFormal ? 0 : 0.05 * 1.15 * size,
            color: accent,
            margin: [1.4 * REM, 0.6 * REM],
        },
        h2Line: {
            paddingBottom: 3 * PX,
            borderBottomWidth: (isModern ? 2 : 1) * PX,
            borderBottomColor: isFormal ? '#1a202c' : isModern ? '#1f3a5f' : '#cbd5e1',
        },
        h3Row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', top: lead(1.05 * size) },
        h3: {
            fontSize: 1.05 * size,
            lineHeight,
            fontWeight: 600,
            color: '#1a202c',
            margin: [0.9 * REM, 0.15 * REM],
        },
        date: {
            flexShrink: 0,
            marginLeft: REM,
            fontSize: 0.9 * 1.05 * size,
            lineHeight,
            fontWeight: 400,
            color: '#4a5568',
        },
        p: { textAlign: 'justify', top: lead(size), margin: [0, 0] },
        li: { color: '#2d3748', top: lead(size), margin: [0, 0.25 * REM] },
        bullet: {
            position: 'absolute',
            left: 1.2 * REM - size - (BULLET_SIZE * size) / 2,
            top: lead(size) + (metrics.ascent - BULLET_RISE - BULLET_SIZE / 2) * size,
            width: BULLET_SIZE * size,
            height: BULLET_SIZE * size,
            borderRadius: (BULLET_SIZE * size) / 2,
            backgroundColor: '#2d3748',
        },
        // Como el navegador: círculo lleno, luego vacío y desde el tercer nivel, cuadrado
        bulletHollow: { backgroundColor: '#fff', borderWidth: 0.08 * size, borderColor: '#2d3748' },
        bulletSquare: { borderRadius: 0 },
        number: { position: 'absolute', right: 0.28 * size, top: lead(size) },
        // Tabla: los valores por omisión del navegador (2px entre celdas y 1px de relleno)
        tr: { flexDirection: 'row', paddingLeft: 2 * PX, top: lead(size), margin: [2 * PX, 2 * PX] },
        cell: { marginRight: 2 * PX, paddingHorizontal: PX, paddingVertical: PX },
        hr: { borderTopWidth: PX, borderTopColor: '#a0aec0', margin: [0, 0] },
    };
};

// Un enlace se ve igual que el texto que lo rodea: no hereda el color por sí solo
const Runs = ({ runs, color }) => runs.map((run, index) => {
    const style = {
        fontWeight: run.bold ? 700 : undefined,
        fontStyle: run.italic ? 'italic' : undefined,
        textDecoration: run.strike ? 'line-through' : undefined,
    };
    return run.href
        ? <Link key={index} src={run.href} style={{ ...style, color, textDecoration: 'none' }}>{run.text}</Link>
        : <Text key={index} style={style}>{run.text}</Text>;
});

const marginsOf = (block, styles) => {
    const [top, ownBottom] = styles[block.kind === 'li-text' ? 'li' : block.kind]?.margin ?? [0, 0];
    const bottom = block.hasInside ? 0 : ownBottom;
    // La lista agrega su margen inferior (0.8rem) después del último elemento
    return [top, block.lastInList ? Math.max(bottom, 0.8 * REM) : bottom];
};

// Medio punto de holgura: con el ancho justo, una diferencia mínima de redondeo
// bastaría para que el texto de la celda pase a dos líneas
const cellWidth = (measured) => (measured === undefined ? undefined : measured + 0.5);

const BlockContent = ({ block, styles, columnWidths }) => {
    const { margin, ...style } = styles[block.kind] ?? {};

    switch (block.kind) {
        case 'h2':
            return <View style={styles.h2Line}><Text style={style}><Runs runs={block.runs} color={style.color} /></Text></View>;
        case 'h3':
            return (
                <View style={styles.h3Row}>
                    <Text style={{ ...style, flexShrink: 1 }}><Runs runs={block.runs} color={style.color} /></Text>
                    {block.date !== null && <Text style={styles.date}>{block.date}</Text>}
                </View>
            );
        case 'li':
        case 'li-text': {
            const { top, color } = styles.li;
            return (
                <View style={{ flexDirection: 'row', paddingLeft: block.depth * 1.2 * REM, color }}>
                    <View style={{ width: 1.2 * REM }}>
                        {block.kind === 'li' && (block.marker
                            ? <Text style={styles.number}>{block.marker}</Text>
                            : <View style={[
                                styles.bullet,
                                block.depth === 1 && styles.bulletHollow,
                                block.depth > 1 && styles.bulletSquare,
                            ]} />)}
                    </View>
                    <Text style={{ top, flex: 1 }}><Runs runs={block.runs} color={color} /></Text>
                </View>
            );
        }
        case 'tr':
            return (
                <View style={{ ...style, color: styles.page.color }}>
                    {block.cells.map((runs, index) => {
                        const align = block.align[index] ?? (block.header ? 'center' : 'left');
                        return (
                            <View key={index} style={{ ...styles.cell, width: cellWidth(columnWidths.get(block.pos)?.[index]) }}>
                                <Text style={{ textAlign: align, fontWeight: block.header ? 700 : undefined }}>
                                    <Runs runs={runs} color={styles.page.color} />
                                </Text>
                            </View>
                        );
                    })}
                </View>
            );
        case 'hr':
            return <View style={style} />;
        default:
            return <Text style={style}><Runs runs={block.runs} color={style.color ?? styles.page.color} /></Text>;
    }
};

// Agrupa cada título con lo que le sigue y aplica el margen entre bloques como en la
// vista previa: el mayor de los dos, no la suma. El grupo empieza página nueva donde la
// vista previa marca el salto, y sin margen arriba, porque al inicio de la hoja no se usa.
const groupBlocks = (blocks, styles, breaks) => {
    const groups = [];
    let current = [];
    let previousBottom = 0;

    blocks.forEach((block, index) => {
        const [top, bottom] = marginsOf(block, styles);
        const startsPage = current.length === 0 && breaks.has(block.pos);
        current.push({ block, gap: startsPage ? 0 : index === 0 ? top : Math.max(previousBottom, top) });
        previousBottom = bottom;

        if (!HEADING_KINDS.includes(block.kind) || index === blocks.length - 1) {
            groups.push({ items: current, startsPage: breaks.has(current[0].block.pos) });
            current = [];
        }
    });

    return groups;
};

const textLength = (items) => items.reduce((total, { block }) => (
    total + [block.runs ?? [], ...(block.cells ?? [])].flat().reduce((sum, run) => sum + run.text.length, 0)
), 0);

// layout: lo medido en la vista previa (saltos de página y ancho de columnas de tablas)
const CVDocument = ({ markdown, format, title, layout = { breaks: new Set(), columnWidths: new Map() } }) => {
    const size = FONT_SIZES.find((f) => f.value === format.fontSize).pt;
    const lineHeight = SPACINGS.find((s) => s.value === format.spacing).lineHeight;
    const margin = getMargin(format);
    const styles = buildStyles(format.template, size, lineHeight);
    const groups = groupBlocks(markdownToBlocks(markdown), styles, layout.breaks);

    return (
        <Document title={title} author={title} creator="Markdown CV" producer="Markdown CV" language="es">
            <Page
                size="A4"
                style={{ ...styles.page, paddingVertical: `${margin.yMm}mm`, paddingHorizontal: `${margin.xMm}mm` }}
            >
                {groups.map(({ items, startsPage }, index) => (
                    // Un texto más largo que una hoja sí se parte, para que no quede cortado
                    <View key={index} break={startsPage} wrap={textLength(items) > MAX_UNSPLIT_CHARS}>
                        {items.map(({ block, gap }, blockIndex) => (
                            <View key={blockIndex} style={{ marginTop: gap }}>
                                <BlockContent block={block} styles={styles} columnWidths={layout.columnWidths} />
                            </View>
                        ))}
                    </View>
                ))}
            </Page>
        </Document>
    );
};

export default CVDocument;
