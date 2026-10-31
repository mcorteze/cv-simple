const STORAGE_KEY = 'markdown-cv:borrador-v2';
const OLD_SAMPLE_MARKER = 'camila.soto@ejemplo.cl';

export const loadDraft = () => {
    try {
        const draft = JSON.parse(localStorage.getItem(STORAGE_KEY));
        // Un ejemplo antiguo guardado no es texto de la persona
        if (draft?.markdown?.includes(OLD_SAMPLE_MARKER)) return { ...draft, markdown: null };
        return draft;
    } catch {
        return null;
    }
};

export const saveDraft = (draft) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        return true;
    } catch (error) {
        console.error("Error al guardar el borrador:", error);
        return false;
    }
};
