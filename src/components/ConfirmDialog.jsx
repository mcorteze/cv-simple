import React, { useEffect, useRef } from 'react';

const ConfirmDialog = ({ open, title, message, confirmLabel, onConfirm, onCancel }) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog"
            onCancel={(e) => { e.preventDefault(); onCancel(); }}
        >
            <h2>{title}</h2>
            <p>{message}</p>
            <div className="confirm-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
            </div>
        </dialog>
    );
};

export default ConfirmDialog;
