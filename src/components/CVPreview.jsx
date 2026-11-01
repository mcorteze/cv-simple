import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { linkBareDomains } from '../utils/textUtils';

// Marca cada bloque con su posición en el texto: así el PDF corta las páginas
// en los mismos bloques que la vista previa
const posOf = (node) => node?.position?.start.offset;

const withPos = (Tag) => {
    const Block = ({ node, ...props }) => <Tag data-pos={posOf(node)} {...props} />;
    Block.displayName = `Pos(${Tag})`;
    return Block;
};

const components = {
    h1: withPos('h1'),
    h2: withPos('h2'),
    p: withPos('p'),
    li: withPos('li'),
    tr: withPos('tr'),
    h3: ({ node, children }) => {
        const parts = React.Children.toArray(children);
        const last = parts[parts.length - 1];
        if (typeof last === 'string' && last.includes('|')) {
            const separator = last.lastIndexOf('|');
            return (
                <h3 data-pos={posOf(node)}>
                    <span>{parts.slice(0, -1)}{last.slice(0, separator).trimEnd()}</span>
                    <span className="date-text">{last.slice(separator + 1).trim()}</span>
                </h3>
            );
        }
        return <h3 data-pos={posOf(node)}>{children}</h3>;
    }
};

const CVPreview = React.forwardRef(({ markdown, template, pageVars }, ref) => {
    const content = useMemo(() => linkBareDomains(markdown), [markdown]);

    return (
        <div className={`cv-page template-${template}`} style={pageVars} ref={ref}>
            <div className="cv-preview-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
});

CVPreview.displayName = 'CVPreview';

export default CVPreview;
