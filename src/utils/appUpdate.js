// GitHub Pages deja la página guardada en el navegador hasta 10 minutos: sin esto, quien
// vuelve a entrar puede seguir viendo la versión anterior. Al abrir la app y al volver a
// la pestaña (nunca mientras se escribe) se pregunta si hay una publicación más nueva y, si la hay, se recarga.
// Lo escrito no se pierde: el borrador ya está guardado en el navegador.

const RELOADED_KEY = 'markdown-cv:recarga-version';

const reloadInto = (build) => {
    try {
        // Si la recarga no trajo la versión nueva, no se insiste: evita recargar sin fin
        if (sessionStorage.getItem(RELOADED_KEY) === build) return;
        sessionStorage.setItem(RELOADED_KEY, build);
    } catch {
        // Sin almacenamiento igual se recarga una vez
    }
    // Una dirección distinta obliga al navegador a pedir la página de nuevo
    const url = new URL(window.location.href);
    url.searchParams.set('v', build);
    window.location.replace(url);
};

const checkForUpdate = async () => {
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' });
        if (!response.ok) return;
        const { build } = await response.json();
        if (build && build !== __BUILD_ID__) reloadInto(build);
    } catch {
        // Sin conexión: se vuelve a intentar más tarde
    }
};

export const watchForUpdates = () => {
    if (!import.meta.env.PROD) return;

    checkForUpdate();
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
    });
    // Una página antigua puede pedir un archivo que ya cambió de nombre: se recarga a la nueva
    window.addEventListener('vite:preloadError', (event) => {
        event.preventDefault();
        checkForUpdate();
    });
};
