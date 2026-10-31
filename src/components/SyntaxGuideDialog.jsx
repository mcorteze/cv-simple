import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const GUIDE_ROWS = [
    ['# Tu nombre', 'Tu nombre, arriba y destacado'],
    ['correo | teléfono | ciudad', 'En la línea siguiente: datos de contacto'],
    ['## EXPERIENCIA', 'Título de una sección'],
    ['### Cargo | 2020 - Presente', 'Cargo a la izquierda y fechas a la derecha'],
    ['**Empresa**', 'Texto en negrita'],
    ['- Una tarea o logro', 'Punto de una lista'],
];

const SyntaxGuideDialog = ({ open, onClose }) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog syntax-dialog"
            aria-labelledby="syntax-dialog-title"
            onCancel={(e) => { e.preventDefault(); onClose(); }}
        >
            <div className="syntax-dialog-header">
                <h2 id="syntax-dialog-title">Cómo escribir tu CV</h2>
                <button type="button" className="icon-button" aria-label="Cerrar" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
            <p>Cada parte se marca con unos pocos signos al inicio de la línea. La vista previa muestra el resultado al instante.</p>
            <div className="syntax-list" role="table">
                <div className="syntax-row syntax-row-head" role="row">
                    <span role="columnheader">Escribes</span>
                    <span role="columnheader">Resultado</span>
                </div>
                {GUIDE_ROWS.map(([syntax, description]) => (
                    <div className="syntax-row" role="row" key={syntax}>
                        <code role="cell">{syntax}</code>
                        <span role="cell">{description}</span>
                    </div>
                ))}
            </div>
            <div className="confirm-actions">
                <button type="button" className="btn btn-primary" onClick={onClose}>Entendido</button>
            </div>
        </dialog>
    );
};

export default SyntaxGuideDialog;
