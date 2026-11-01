import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    ChevronDown,
    FolderOpen,
    Loader2,
    Check,
    ClipboardCheck,
    Copy,
    Download,
    FilePlus,
    FileText,
    Upload,
    FileDown,
    AlertTriangle,
    X,
    ZoomIn,
    ZoomOut,
    Maximize
} from 'lucide-react';

import ConfirmDialog from './components/ConfirmDialog';
import CVPreview from './components/CVPreview';
import EditorToolbar, { toggleBold } from './components/EditorToolbar';
import GuideButton from './components/GuideButton';
import Popover from './components/Popover';
import WelcomeDialog from './components/WelcomeDialog';
import { SAMPLE_CV } from './data/sampleCV';
import { downloadTxtFile } from './utils/exportUtils';
import {
    TEMPLATES,
    FONT_SIZES,
    MARGINS,
    SPACINGS,
    getMargin,
    getPageVars,
    normalizeFormat
} from './utils/cvFormat';
import { computePageBreaks } from './utils/pagination';
import { reviewCV } from './utils/reviewCV';
import { loadDraft, loadWelcomeSeen, saveDraft, saveWelcomeSeen } from './utils/storage';
import { decodeTextFile, markdownToPlainText } from './utils/textUtils';

const A4_WIDTH_PX = 794;
const MOBILE_QUERY = '(max-width: 767px)';
const MIN_EDITOR_WIDTH = 20;
const MAX_EDITOR_WIDTH = 80;
const COPIED_FEEDBACK_MS = 2000;
const STORE_URL = 'https://aloasesoriasexcel.cl';
const FILE_MENU_MAX_WIDTH = 260;
const FILE_MENU_GROUPS = [
    { title: 'Empezar', keys: ['new', 'sample', 'import'] },
    { title: 'Llevar el texto a otro lugar', keys: ['copy', 'txt'] },
];

// Versión y hora de publicación, en hora de Chile: así se sabe si llegó el último cambio
const APP_VERSION_LABEL = `v${__APP_VERSION__} · ${new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
}).format(new Date(__BUILD_ID__))}`;

const EDITOR_PLACEHOLDER = `# Tu nombre
correo | teléfono | ciudad

## EXPERIENCIA

### Cargo | 2020 - Presente
**Empresa / Ciudad**
- Una tarea o logro

Empieza a escribir aquí o usa los botones de arriba.`;

const FORMAT_CONTROLS = [
    { key: 'template', label: 'Diseño', options: TEMPLATES },
    { key: 'fontSize', label: 'Letra', options: FONT_SIZES },
    { key: 'margin', label: 'Márgenes', options: MARGINS },
    { key: 'spacing', label: 'Espaciado', options: SPACINGS },
];

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

    useEffect(() => {
        const query = window.matchMedia(MOBILE_QUERY);
        const handleChange = (e) => setIsMobile(e.matches);
        query.addEventListener('change', handleChange);
        return () => query.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
};

function App() {
    const [markdown, setMarkdown] = useState(() => loadDraft()?.markdown ?? SAMPLE_CV);
    const [format, setFormat] = useState(() => normalizeFormat(loadDraft()?.format));
    const [isSaved, setIsSaved] = useState(true);
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [pageHeight, setPageHeight] = useState(0);
    const [pageBreaks, setPageBreaks] = useState([]);
    const [mobileTab, setMobileTab] = useState('editor');
    const [editorWidth, setEditorWidth] = useState(45);
    const [pendingReplace, setPendingReplace] = useState(null);
    const [notice, setNotice] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => !loadWelcomeSeen());

    const isMobile = useIsMobile();

    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const componentRef = useRef();
    const previewScrollRef = useRef();
    const mainRef = useRef(null);
    const manualZoomRef = useRef(false);

    useEffect(() => {
        // El ejemplo no se guarda: así la app siempre muestra su versión actual
        setIsSaved(saveDraft({ markdown: markdown === SAMPLE_CV ? null : markdown, format }));
    }, [markdown, format]);

    const autoScale = () => {
        const container = previewScrollRef.current;
        if (!container?.clientWidth) return;

        const styles = getComputedStyle(container);
        const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        setScale(Math.min(1, (container.clientWidth - padding) / A4_WIDTH_PX));
    };

    useLayoutEffect(() => {
        const fitUnlessZoomed = () => {
            if (!manualZoomRef.current) autoScale();
        };

        fitUnlessZoomed();
        const observer = new ResizeObserver(fitUnlessZoomed);
        if (previewScrollRef.current) observer.observe(previewScrollRef.current);
        return () => observer.disconnect();
    }, [isMobile]);

    // Mide la hoja para mostrar dónde cortan las páginas
    useLayoutEffect(() => {
        const measure = () => {
            const page = componentRef.current;
            if (!page?.offsetHeight) return;
            setPageHeight(page.offsetHeight);
            setPageBreaks(computePageBreaks(page, getMargin(format).yMm));
        };

        measure();
        document.fonts?.ready.then(measure);
        const observer = new ResizeObserver(measure);
        if (componentRef.current) observer.observe(componentRef.current);
        return () => observer.disconnect();
    }, [markdown, format, isMobile]);

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            // Se carga al exportar: el generador de PDF pesa más que el resto de la app
            const { downloadCvPdf } = await import('./utils/exportPdf');
            await downloadCvPdf(markdown, format);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            setNotice('No se pudo generar el PDF. Vuelve a intentarlo en unos segundos.');
        } finally {
            setIsExporting(false);
        }
    };

    const pageCount = pageBreaks.length + 1;
    const reviewIssues = useMemo(() => reviewCV(markdown, pageCount), [markdown, pageCount]);

    const applyReplace = ({ text, message }) => {
        setMarkdown(text);
        setNotice(message);
        setPendingReplace(null);
    };

    const replaceMarkdown = (text, message = '') => {
        const hasOwnText = markdown.trim() && markdown !== SAMPLE_CV;
        if (hasOwnText) setPendingReplace({ text, message });
        else applyReplace({ text, message });
    };

    const importFile = async (file) => {
        const name = file.name.toLowerCase();

        try {
            if (name.endsWith('.docx')) {
                const { docxToMarkdown } = await import('./utils/importWord');
                replaceMarkdown(
                    await docxToMarkdown(await file.arrayBuffer()),
                    'CV importado desde Word. Revisa los títulos, los cargos y las fechas, porque cada documento está armado de forma distinta.'
                );
            } else if (name.endsWith('.md') || name.endsWith('.txt')) {
                replaceMarkdown(decodeTextFile(await file.arrayBuffer()));
            } else {
                setNotice('Formato no compatible. Usa un archivo .docx, .md o .txt. Un .doc antiguo debe guardarse primero como .docx desde Word.');
            }
        } catch (error) {
            console.error("Error al importar el archivo:", error);
            setNotice('No se pudo leer el archivo. Revisa que no esté dañado o protegido con contraseña.');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) importFile(file);
        event.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) importFile(file);
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
    };

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(markdownToPlainText(markdown));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
        } catch {
            setNotice('El navegador no permitió copiar el texto.');
        }
    };

    const handleEditorKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            toggleBold(e.currentTarget);
        }
    };

    const handleManualZoom = (e) => {
        manualZoomRef.current = true;
        setScale(Number(e.target.value));
    };

    const handleFitZoom = () => {
        manualZoomRef.current = false;
        autoScale();
    };

    const resizeEditor = (percent) => {
        setEditorWidth(Math.min(MAX_EDITOR_WIDTH, Math.max(MIN_EDITOR_WIDTH, percent)));
    };

    const handleDividerMove = (e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const rect = mainRef.current.getBoundingClientRect();
        resizeEditor(((e.clientX - rect.left) / rect.width) * 100);
    };

    const handleDividerKeyDown = (e) => {
        if (e.key === 'ArrowLeft') resizeEditor(editorWidth - 2);
        if (e.key === 'ArrowRight') resizeEditor(editorWidth + 2);
    };

    const fileActions = {
        new: { label: 'Nuevo', Icon: FilePlus, run: () => replaceMarkdown('') },
        sample: { label: 'Ejemplo', Icon: FileText, run: () => replaceMarkdown(SAMPLE_CV) },
        import: { label: 'Importar', Icon: Upload, run: () => fileInputRef.current.click() },
        copy: { label: 'Copiar texto', Icon: Copy, run: handleCopyText },
        txt: { label: 'Descargar .txt', Icon: Download, run: () => downloadTxtFile(markdown) },
    };

    const editorPane = (
        <div className="pane" data-guide="editor">
            <div className="pane-header">
                <span>Editor</span>
                <span className="save-status" data-guide="save-status">
                    {isSaved ? 'Guardado solo en este navegador' : 'No se pudo guardar en este navegador'}
                </span>
            </div>
            <EditorToolbar textareaRef={textareaRef} />
            <textarea
                ref={textareaRef}
                className="editor-container"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                placeholder={EDITOR_PLACEHOLDER}
                spellCheck="true"
                lang="es"
            />
        </div>
    );

    const previewPane = (
        <div className="pane pane-preview">
            <div className="pane-header">
                <div className="preview-summary" data-guide="review">
                    <span>Vista previa · {pageCount} {pageCount === 1 ? 'página' : 'páginas'}</span>
                    <Popover
                        trigger={reviewIssues.length === 0
                            ? <><ClipboardCheck size={13} />Revisión: sin avisos</>
                            : <><AlertTriangle size={13} />Revisión: {reviewIssues.length} {reviewIssues.length === 1 ? 'aviso' : 'avisos'}</>}
                        triggerClassName="review-trigger"
                        title="Revisión del CV"
                    >
                        {reviewIssues.length === 0 ? (
                            <p className="review-ok">
                                <Check size={14} />
                                No se encontraron problemas básicos.
                            </p>
                        ) : (
                            <ul className="review-list">
                                {reviewIssues.map((issue) => <li key={issue}>{issue}</li>)}
                            </ul>
                        )}
                    </Popover>
                </div>
                <div className="scale-controls" data-guide="zoom">
                    <ZoomOut size={14} />
                    <input
                        type="range"
                        aria-label="Zoom"
                        min={0.3}
                        max={1.5}
                        step={0.01}
                        value={scale}
                        onChange={handleManualZoom}
                    />
                    <ZoomIn size={14} />
                    <button
                        type="button"
                        className="icon-button"
                        title="Ajuste automático"
                        aria-label="Ajuste automático"
                        onClick={handleFitZoom}
                    >
                        <Maximize size={14} />
                    </button>
                </div>
            </div>
            <div className="format-bar" data-guide="format">
                {FORMAT_CONTROLS.map(({ key, label, options }) => (
                    <label className="format-control" key={key}>
                        <span>{label}</span>
                        <select
                            value={format[key]}
                            onChange={(e) => {
                                const { value } = e.target;
                                setFormat((current) => ({ ...current, [key]: value }));
                            }}
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                ))}
            </div>
            <div className="preview-pane" ref={previewScrollRef}>
                <div
                    className="cv-page-sizer"
                    data-guide="page"
                    style={{ width: A4_WIDTH_PX * scale, height: pageHeight * scale }}
                >
                    <div className="cv-page-wrapper" style={{ transform: `scale(${scale})` }}>
                        <CVPreview
                            ref={componentRef}
                            markdown={markdown}
                            template={format.template}
                            pageVars={getPageVars(format)}
                        />
                        {pageBreaks.map(({ top }, index) => (
                            <div className="page-break-marker" key={top} style={{ top }}>
                                <span>Página {index + 2}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const guideButton = (
        <GuideButton
            onShowPane={setMobileTab}
            isSample={markdown === SAMPLE_CV}
            onLoadSample={() => replaceMarkdown(SAMPLE_CV)}
            onClearSample={() => replaceMarkdown('')}
            onShowWelcome={() => setIsWelcomeOpen(true)}
        />
    );

    return (
        <div className="app-container"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>

            <WelcomeDialog
                open={isWelcomeOpen}
                onClose={() => {
                    saveWelcomeSeen();
                    setIsWelcomeOpen(false);
                }}
            />

            <ConfirmDialog
                open={pendingReplace !== null}
                title="¿Reemplazar el texto actual?"
                message="Se perderá lo que escribiste. Si quieres conservarlo, descárgalo antes de continuar."
                confirmLabel="Reemplazar"
                onConfirm={() => applyReplace(pendingReplace)}
                onCancel={() => setPendingReplace(null)}
            />

            {isDragging && (
                <div className="drag-overlay">
                    <div className="drag-message">
                        <Upload size={64} strokeWidth={1.5} />
                        <p>Suelta tu archivo aquí</p>
                    </div>
                </div>
            )}

            <header className="toolbar">
                <div className="toolbar-brand">
                    <div className="logo">
                        <span>Markdown CV</span>
                        <span className="brand-meta">
                            <a
                                className="store-link"
                                href={STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Aló Asesorías Excel
                            </a>
                            <span className="app-version">{APP_VERSION_LABEL}</span>
                        </span>
                    </div>
                    {isMobile && guideButton}
                </div>
                <div className="actions" data-guide="actions">
                    <input type="file" ref={fileInputRef} hidden accept=".docx,.md,.txt" onChange={handleFileUpload} />
                    {isMobile ? (
                        // En el teléfono las acciones de archivo van en un menú: la barra queda con dos botones
                        <Popover
                            trigger={<>
                                {isCopied ? <Check size={14} /> : <FolderOpen size={14} />}
                                {isCopied ? 'Copiado' : 'Archivo'}
                                <ChevronDown size={14} />
                            </>}
                            triggerClassName="btn btn-secondary file-menu-trigger"
                            triggerProps={{ 'data-guide': 'import copy' }}
                            panelMaxWidth={FILE_MENU_MAX_WIDTH}
                        >
                            {(close) => (
                                <div className="guide-menu">
                                    {FILE_MENU_GROUPS.map(({ title, keys }) => (
                                        <React.Fragment key={title}>
                                            <p className="guide-menu-group">{title}</p>
                                            {keys.map((key) => {
                                                const { label, Icon, run } = fileActions[key];
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        className="guide-menu-item"
                                                        onClick={() => { close(); run(); }}
                                                    >
                                                        <Icon size={14} />
                                                        <span>{label}</span>
                                                    </button>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </Popover>
                    ) : Object.entries(fileActions).map(([key, { label, Icon, run }]) => (
                        <button key={key} className="btn btn-secondary" title={label} data-guide={key} onClick={run}>
                            {key === 'copy' && isCopied ? <Check size={14} /> : <Icon size={14} />}
                            <span className="btn-label">{key === 'copy' && isCopied ? 'Copiado' : label}</span>
                        </button>
                    ))}

                    <button className="btn btn-primary" data-guide="pdf" onClick={handleExportPdf} disabled={isExporting}>
                        {isExporting ? <Loader2 size={14} className="spin" /> : <FileDown size={14} />}
                        {isExporting ? 'Generando…' : 'Exportar PDF'}
                    </button>
                    {!isMobile && guideButton}
                </div>
            </header>

            {notice && (
                <div className="app-notice" role="status">
                    <span>{notice}</span>
                    <button type="button" className="icon-button" aria-label="Cerrar aviso" onClick={() => setNotice('')}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {isMobile ? (
                <main className="main-content mobile-content">
                    <div className="mobile-tabs">
                        <button
                            type="button"
                            className={mobileTab === 'editor' ? 'is-active' : ''}
                            onClick={() => setMobileTab('editor')}
                        >
                            Editor
                        </button>
                        <button
                            type="button"
                            className={mobileTab === 'preview' ? 'is-active' : ''}
                            onClick={() => setMobileTab('preview')}
                        >
                            Vista previa
                        </button>
                    </div>
                    <div className="mobile-pane" hidden={mobileTab !== 'editor'}>{editorPane}</div>
                    <div className="mobile-pane" hidden={mobileTab !== 'preview'}>{previewPane}</div>
                </main>
            ) : (
                <main className="main-content" ref={mainRef}>
                    <div className="split-panel" style={{ width: `${editorWidth}%` }}>
                        {editorPane}
                    </div>
                    <div
                        className="split-divider"
                        data-guide="divider"
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Cambiar ancho del editor"
                        aria-valuenow={Math.round(editorWidth)}
                        aria-valuemin={MIN_EDITOR_WIDTH}
                        aria-valuemax={MAX_EDITOR_WIDTH}
                        tabIndex={0}
                        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
                        onPointerMove={handleDividerMove}
                        onKeyDown={handleDividerKeyDown}
                    />
                    <div className="split-panel split-panel-grow">
                        {previewPane}
                    </div>
                </main>
            )}
        </div>
    );
}

export default App;
