import React from 'react';
import { Bold, Briefcase, Heading2, HelpCircle, List } from 'lucide-react';

import Popover from './Popover';

const GUIDE_ROWS = [
    ['# Tu nombre', 'Nombre, arriba y destacado'],
    ['correo | teléfono | ciudad', 'Línea siguiente: datos de contacto'],
    ['## EXPERIENCIA', 'Título de sección'],
    ['### Cargo | 2020 - Presente', 'Cargo a la izquierda, fechas a la derecha'],
    ['**Empresa**', 'Texto en negrita'],
    ['- Una tarea o logro', 'Punto de una lista'],
];

// execCommand mantiene el deshacer del navegador y dispara el onChange del textarea.
const insertText = (textarea, start, end, text, selectFrom, selectTo) => {
    textarea.focus();
    textarea.setSelectionRange(start, end);
    document.execCommand('insertText', false, text);
    textarea.setSelectionRange(selectFrom, selectTo);
};

const insertBlock = (textarea, block, placeholder) => {
    const { value, selectionEnd } = textarea;
    const lineEnd = value.indexOf('\n', selectionEnd);
    const position = lineEnd === -1 ? value.length : lineEnd;

    let prefix = '\n\n';
    if (position === 0 || value.slice(position - 2, position) === '\n\n') prefix = '';
    else if (value[position - 1] === '\n') prefix = '\n';

    const selectFrom = position + prefix.length + block.indexOf(placeholder);
    insertText(textarea, position, position, prefix + block, selectFrom, selectFrom + placeholder.length);
};

export const toggleBold = (textarea) => {
    const { value, selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || 'texto';
    const selectFrom = selectionStart + 2;
    insertText(textarea, selectionStart, selectionEnd, `**${selected}**`, selectFrom, selectFrom + selected.length);
};

const toggleList = (textarea) => {
    const { value, selectionStart, selectionEnd } = textarea;
    const start = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionEnd);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const lines = value
        .slice(start, end)
        .split('\n')
        .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
        .join('\n');
    const caret = start + lines.length;
    insertText(textarea, start, end, lines, caret, caret);
};

const EditorToolbar = ({ textareaRef }) => {
    const tools = [
        {
            label: 'Sección',
            icon: Heading2,
            run: (textarea) => insertBlock(textarea, '## NOMBRE DE LA SECCIÓN\n', 'NOMBRE DE LA SECCIÓN'),
        },
        {
            label: 'Cargo y fecha',
            icon: Briefcase,
            run: (textarea) => insertBlock(textarea, '### Cargo | 2020 - Presente\n**Empresa / Ciudad**\n- ', 'Cargo'),
        },
        { label: 'Lista', icon: List, run: toggleList },
        { label: 'Negrita', icon: Bold, run: toggleBold },
    ];

    return (
        <div className="editor-toolbar">
            {tools.map(({ label, icon: Icon, run }) => (
                <button
                    key={label}
                    type="button"
                    className="editor-tool"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => run(textareaRef.current)}
                >
                    <Icon size={14} />
                    {label}
                </button>
            ))}
            <div className="editor-tool-guide">
                <Popover
                    trigger={<><HelpCircle size={14} />Guía</>}
                    triggerClassName="editor-tool"
                    title="Cómo escribir tu CV"
                >
                    <table className="guide-table">
                        <tbody>
                            {GUIDE_ROWS.map(([syntax, description]) => (
                                <tr key={syntax}>
                                    <td><code>{syntax}</code></td>
                                    <td>{description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Popover>
            </div>
        </div>
    );
};

export default EditorToolbar;
