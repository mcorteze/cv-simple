import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const VIEWPORT_GUTTER = 16;
const CARD_GAP = 12;
const SPOTLIGHT_PADDING = 4;
const PANE_WAIT_MS = 300;
const TALL_ZONE_RATIO = 0.45;

// La zona solo cuenta si está a la vista (en celular, la otra pestaña no existe en pantalla).
const findZone = (selector) => {
    const el = document.querySelector(selector);
    return el && el.getClientRects().length > 0 ? el : null;
};

// Tras cambiar de pestaña, la zona tarda un instante en aparecer.
const waitForZone = async (selector, ms) => {
    const end = Date.now() + ms;
    for (;;) {
        const el = findZone(selector);
        if (el || Date.now() > end) return el;
        await new Promise((resolve) => setTimeout(resolve, 60));
    }
};

// Junto a la zona, abajo o arriba; si no cabe o la zona es muy alta, fija abajo.
const placeCard = (rect, card) => {
    if (!rect) return { className: 'tour-card-center' };

    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const below = rect.bottom + CARD_GAP;
    const above = rect.top - CARD_GAP - height;
    const isTall = rect.height > window.innerHeight * TALL_ZONE_RATIO;
    const left = Math.max(VIEWPORT_GUTTER, Math.min(rect.left, window.innerWidth - width - VIEWPORT_GUTTER));

    if (!isTall && below + height <= window.innerHeight - VIEWPORT_GUTTER) return { style: { top: below, left } };
    if (!isTall && above >= VIEWPORT_GUTTER) return { style: { top: above, left } };
    return { className: 'tour-card-bottom' };
};

// Recorre los pasos de una guía sobre la pantalla real. Los pasos cuya zona no está a la vista se omiten.
const GuideTour = ({ guide, onShowPane, onClose }) => {
    const [index, setIndex] = useState(null);
    const [rect, setRect] = useState(null);
    const [placement, setPlacement] = useState(null);
    const zoneRef = useRef(null);
    const cardRef = useRef(null);
    const nextRef = useRef(null);
    const turnRef = useRef(0);

    const total = guide.steps.length;
    const step = index === null ? null : guide.steps[index];

    const move = useCallback(async (from, direction) => {
        const turn = ++turnRef.current;
        for (let i = from; i >= 0 && i < total; i += direction) {
            const { zone, pane } = guide.steps[i];
            if (pane) onShowPane(pane);
            const el = zone ? await waitForZone(zone, pane ? PANE_WAIT_MS : 0) : null;
            if (turn !== turnRef.current) return;
            if (zone && !el) continue;

            el?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            zoneRef.current = el;
            setRect(el ? el.getBoundingClientRect() : null);
            setPlacement(null);
            setIndex(i);
            return;
        }
        // Sin más pasos que mostrar: hacia adelante termina; hacia atrás se queda donde está.
        if (direction > 0) onClose(from > 0);
    }, [guide, total, onShowPane, onClose]);

    useEffect(() => {
        move(0, 1);
        return () => { turnRef.current++; };
    }, [move]);

    useEffect(() => {
        if (index === null) return undefined;

        const follow = () => setRect(zoneRef.current ? zoneRef.current.getBoundingClientRect() : null);
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose(false);
            if (e.key === 'ArrowRight') move(index + 1, 1);
            if (e.key === 'ArrowLeft' && index > 0) move(index - 1, -1);
        };

        window.addEventListener('resize', follow);
        window.addEventListener('scroll', follow, true);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('resize', follow);
            window.removeEventListener('scroll', follow, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [index, move, onClose]);

    useLayoutEffect(() => {
        if (cardRef.current) setPlacement(placeCard(rect, cardRef.current));
    }, [rect, index]);

    useEffect(() => {
        nextRef.current?.focus();
    }, [index]);

    if (!step) return null;

    const isLast = index === total - 1;

    return createPortal(
        <div className="tour-layer">
            <div className={rect ? 'tour-blocker' : 'tour-blocker tour-blocker-dim'} onMouseDown={(e) => e.preventDefault()} />
            {rect && (
                <div
                    className="tour-spotlight"
                    style={{
                        top: rect.top - SPOTLIGHT_PADDING,
                        left: rect.left - SPOTLIGHT_PADDING,
                        width: rect.width + 2 * SPOTLIGHT_PADDING,
                        height: rect.height + 2 * SPOTLIGHT_PADDING,
                    }}
                />
            )}
            <div
                ref={cardRef}
                className={`tour-card ${placement?.className ?? ''}`}
                style={placement ? placement.style : { visibility: 'hidden' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tour-title"
            >
                <div className="tour-card-header">
                    <p className="tour-title" id="tour-title">{step.title}</p>
                    <button type="button" className="icon-button" aria-label="Cerrar guía" onClick={() => onClose(false)}>
                        <X size={14} />
                    </button>
                </div>
                <p className="tour-text">{step.text}</p>
                <div className="tour-footer">
                    <span className="tour-count">{index + 1} de {total}</span>
                    <div className="tour-buttons">
                        {index > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => move(index - 1, -1)}>
                                Anterior
                            </button>
                        )}
                        <button type="button" className="btn btn-primary" ref={nextRef} onClick={() => move(index + 1, 1)}>
                            {isLast ? 'Terminar' : 'Siguiente'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GuideTour;
