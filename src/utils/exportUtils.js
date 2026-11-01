// Arma el nombre del archivo desde el título del CV: "# Ana Pérez" -> CV_Ana_Perez
export const getCvFileName = (markdown) => {
  const name = (markdown.match(/^#\s+(.+)$/m)?.[1] ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return name ? `CV_${name}` : 'CV';
};

// Safari en iPhone sigue leyendo el archivo después del clic: si el enlace temporal
// se libera de inmediato, la descarga queda vacía.
const RELEASE_URL_MS = 60000;

export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);

  const element = document.createElement('a');
  element.href = url;
  element.download = fileName;
  element.rel = 'noopener';

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  setTimeout(() => URL.revokeObjectURL(url), RELEASE_URL_MS);
};

export const downloadTxtFile = (content) => {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${getCvFileName(content)}.txt`);
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
  }
};
