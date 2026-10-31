// Arma el nombre del archivo desde el título del CV: "# Ana Pérez" -> CV_Ana_Perez
export const getCvFileName = (markdown) => {
  const name = (markdown.match(/^#\s+(.+)$/m)?.[1] ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return name ? `CV_${name}` : 'CV';
};

export const downloadTxtFile = (content) => {
  try {
    const fileName = `${getCvFileName(content)}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.href = url;
    element.download = fileName;

    document.body.appendChild(element);
    element.click();

    setTimeout(() => {
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
  }
};
