import React, { useEffect, useRef, useState } from 'react';

import { loadWelcomeSeen, saveWelcomeSeen } from '../utils/storage';

// Mensaje de la primera visita. Se muestra una sola vez por navegador.
const WelcomeDialog = () => {
    const [open, setOpen] = useState(() => !loadWelcomeSeen());
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const close = () => {
        saveWelcomeSeen();
        setOpen(false);
    };

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog welcome-dialog"
            onCancel={(e) => { e.preventDefault(); close(); }}
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
                <button type="button" className="btn btn-primary" onClick={close}>Comenzar</button>
            </div>
        </dialog>
    );
};

export default WelcomeDialog;
