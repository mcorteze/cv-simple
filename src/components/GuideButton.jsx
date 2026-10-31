import React, { useCallback, useState } from 'react';
import { BookOpen, Check, Compass, FlaskConical, Rocket } from 'lucide-react';

import GuideTour from './GuideTour';
import Popover from './Popover';
import { GUIDES, GUIDE_GROUPS } from '../data/guides';
import { loadViewedGuides, saveViewedGuides } from '../utils/storage';

const MENU_MAX_WIDTH = 300;

const screenGuide = GUIDES.find((guide) => guide.type === 'screen');
const actionGuides = GUIDES.filter((guide) => guide.type === 'action');
const generalGuide = GUIDES.find((guide) => guide.type === 'general');

// Botón "?" de la barra: qué se puede hacer en la app. Conocer la pantalla, guías de acción,
// recorrido general y el CV de ejemplo.
const GuideButton = ({ onShowPane, isSample, onLoadSample, onClearSample }) => {
    const [activeGuide, setActiveGuide] = useState(null);
    const [viewed, setViewed] = useState(loadViewedGuides);

    const handleClose = useCallback((finished) => {
        if (finished) {
            setViewed((current) => {
                const next = [...new Set([...current, activeGuide.id])];
                saveViewedGuides(next);
                return next;
            });
        }
        setActiveGuide(null);
    }, [activeGuide]);

    const renderItem = (guide, Icon, close) => (
        <button
            key={guide.id}
            type="button"
            className="guide-menu-item"
            onClick={() => { close(); setActiveGuide(guide); }}
        >
            <Icon size={14} />
            <span>{guide.title}</span>
            {viewed.includes(guide.id) && <Check size={14} className="guide-menu-check" aria-label="Vista" />}
        </button>
    );

    return (
        <>
            <Popover
                trigger="?"
                triggerClassName="guide-button"
                triggerProps={{ 'data-guide': 'guide', 'aria-label': 'Ayuda: qué puedo hacer aquí', title: 'Qué puedo hacer aquí' }}
                panelMaxWidth={MENU_MAX_WIDTH}
            >
                {(close) => (
                    <div className="guide-menu">
                        <p className="guide-menu-group">{GUIDE_GROUPS.screen}</p>
                        {renderItem(screenGuide, Compass, close)}
                        <p className="guide-menu-group">{GUIDE_GROUPS.action}</p>
                        {actionGuides.map((guide) => renderItem(guide, BookOpen, close))}
                        <hr />
                        {renderItem(generalGuide, Rocket, close)}
                        <hr />
                        <button
                            type="button"
                            className="guide-menu-item"
                            onClick={() => { close(); (isSample ? onClearSample : onLoadSample)(); }}
                        >
                            <FlaskConical size={14} />
                            <span>{isSample ? 'Quitar el CV de ejemplo' : 'Probar con el CV de ejemplo'}</span>
                        </button>
                    </div>
                )}
            </Popover>
            {activeGuide && <GuideTour guide={activeGuide} onShowPane={onShowPane} onClose={handleClose} />}
        </>
    );
};

export default GuideButton;
