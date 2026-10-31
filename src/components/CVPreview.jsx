import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { linkBareDomains } from '../utils/textUtils';

const CVPreview = React.forwardRef(({ markdown, template, pageVars }, ref) => {
    const content = useMemo(() => linkBareDomains(markdown), [markdown]);

    const components = {
        h3: ({ children }) => {
            const parts = React.Children.toArray(children);
            const last = parts[parts.length - 1];
            if (typeof last === 'string' && last.includes('|')) {
                const separator = last.lastIndexOf('|');
                return (
                    <h3>
                        <span>{parts.slice(0, -1)}{last.slice(0, separator).trimEnd()}</span>
                        <span className="date-text">{last.slice(separator + 1).trim()}</span>
                    </h3>
                );
            }
            return <h3>{children}</h3>;
        }
    };

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
