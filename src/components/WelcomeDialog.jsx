import React, { useEffect, useRef } from 'react';

// Mensaje de la primera visita. Después se abre desde el menú de ayuda.
const WelcomeDialog = ({ open, onClose }) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog welcome-dialog"
            onCancel={(e) => { e.preventDefault(); onClose(); }}
        >
            <h2>Hola, te doy la bienvenida</h2>
            <p>Este editor de CV es un recurso hecho para colegas y es completamente gratuito.</p>
            <p>
                Al principio toma un poco de práctica: el CV se escribe con marcas simples en lugar de botones
                de formato. A cambio, el resultado es un documento limpio y profesional.
            </p>
            <p>
                Lo creé desde Aló Asesorías Excel con una sola intención: ayudar y crecer juntos como colegas.
                Si te sirve, te pido algo a cambio: comparte también algo tuyo con otros, sin esperar nada,
                tal como hice yo.
            </p>
            <div className="confirm-actions">
                <button type="button" className="btn btn-primary" onClick={onClose}>Comenzar</button>
            </div>
        </dialog>
    );
};

export default WelcomeDialog;
