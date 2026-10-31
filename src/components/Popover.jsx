import React, { useEffect, useRef, useState } from 'react';

const PANEL_MAX_WIDTH = 420;
const VIEWPORT_GUTTER = 16;

// Panel con posición fija: los paneles de la app recortan lo que se sale de ellos.
// children puede ser una función que recibe cómo cerrar el panel.
const Popover = ({ trigger, triggerClassName, triggerProps, title, panelMaxWidth = PANEL_MAX_WIDTH, children }) => {
    const [position, setPosition] = useState(null);
    const rootRef = useRef(null);
    const isOpen = position !== null;
    const close = () => setPosition(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleMouseDown = (e) => {
            if (!rootRef.current.contains(e.target)) close();
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') close();
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', close);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', close);
        };
    }, [isOpen]);

    const toggle = (e) => {
        if (isOpen) {
            setPosition(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const width = Math.min(panelMaxWidth, window.innerWidth - 2 * VIEWPORT_GUTTER);
        setPosition({
            top: rect.bottom + 6,
            left: Math.max(VIEWPORT_GUTTER, Math.min(rect.left, window.innerWidth - width - VIEWPORT_GUTTER)),
            width,
        });
    };

    return (
        <div className="popover" ref={rootRef}>
            <button type="button" className={triggerClassName} aria-expanded={isOpen} onClick={toggle} {...triggerProps}>
                {trigger}
            </button>
            {isOpen && (
                <div className="popover-panel" style={position}>
                    {title && <p className="popover-title">{title}</p>}
                    {typeof children === 'function' ? children(close) : children}
                </div>
            )}
        </div>
    );
};

export default Popover;
